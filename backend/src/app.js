require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool, init, getSettings, defaults } = require('./db');
const { notify } = require('./mail');

const app = express();
app.disable('x-powered-by');


// ok changes here made
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL
          .split(',')
          .map((s) => s.trim())
      : true,
    credentials: true,
  })
);

app.use(express.json({ limit: '300kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' });
  next();
});

const r = express.Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const same = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const auth = (req, res, next) => {
  try { jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Unauthorized' }); }
};
const list = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((s) => String(s).trim()).filter(Boolean);
const str = (v, n = 2000) => String(v ?? '').slice(0, n);
const projectArgs = (b) => [str(b.title, 200), str(b.subtitle, 200), str(b.description), list(b.tags), str(b.live_url, 500), str(b.repo_url, 500), str(b.image_url, 1000), str(b.icon || 'code', 40), b.featured !== false];
const EXP_SQL = 'select * from experiences order by current desc, start_date desc, id desc';
const expArgs = (b) => [str(b.company, 200), str(b.logo_url, 1000), str(b.role, 200), str(b.emp_type || 'Full-time', 40), str(b.location, 120), str(b.work_mode, 40), str(b.start_date, 10), b.current ? '' : str(b.end_date, 10), !!b.current, str(b.description, 3000), list(b.tech), str(b.url, 500)];
const ipOf = (req) => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

r.use((req, res, next) => init().then(() => next(), next));
r.get('/health', (req, res) => res.json({ ok: true }));

/* ---------- public ---------- */
r.get('/site', wrap(async (req, res) => {
  const [settings, p, s, x] = await Promise.all([getSettings(), pool.query('select * from projects order by position,id'), pool.query('select * from skills order by id'), pool.query(EXP_SQL)]);
  res.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60').json({ settings, projects: p.rows, skills: s.rows, experiences: x.rows });
}));
r.get('/projects', wrap(async (req, res) => res.json((await pool.query('select * from projects order by position,id')).rows)));
r.get('/experiences', wrap(async (req, res) => res.json((await pool.query(EXP_SQL)).rows)));
r.get('/skills', wrap(async (req, res) => res.json((await pool.query('select * from skills order by id')).rows)));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (v) => String(v || '').trim().toLowerCase();

/* Submit contact message — no email verification required. */
r.post('/contact', wrap(async (req, res) => {
  const { name, message, website } = req.body;
  if (website) return res.status(201).json({ ok: true }); // honeypot
  const addr = normEmail(req.body.email);
  if (!name || !EMAIL_RE.test(addr) || !message || String(message).length > 3000) return res.status(400).json({ error: 'Please fill in all fields correctly.' });
  const ip = ipOf(req);
  const recent = await pool.query("select count(*)::int c from messages where ip=$1 and created_at > now() - interval '10 minutes'", [ip]);
  if (recent.rows[0].c >= 3) return res.status(429).json({ error: 'Too many messages. Please try again in a few minutes.' });
  const m = { name: str(name, 120), email: addr, message: str(message, 3000) };
  const q = await pool.query('insert into messages(name,email,message,ip) values($1,$2,$3,$4) returning id', [m.name, m.email, m.message, ip]);
  let sent = false;
  try { sent = await notify(m); } catch (e) { console.error('mail failed:', e.message); }
  if (sent) await pool.query('update messages set notified=true where id=$1', [q.rows[0].id]);
  res.status(201).json({ ok: true });
}));

/* ---------- media (images stored in Postgres) ---------- */
const IMG = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
r.post('/upload', auth, express.raw({ type: IMG, limit: '4mb' }), wrap(async (req, res) => {
  const mime = (req.headers['content-type'] || '').split(';')[0];
  if (!IMG.includes(mime) || !Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Unsupported file (use JPG, PNG, WebP or PDF, max 4MB)' });
  let name = ''; try { name = decodeURIComponent(String(req.headers['x-file-name'] || '')); } catch {}
  name = name.replace(/[^\w.\- ]/g, '_').slice(0, 100);
  const q = await pool.query('insert into media(mime,data,name) values($1,$2,$3) returning id', [mime, req.body, name]);
  res.status(201).json({ id: q.rows[0].id, url: `/api/media/${q.rows[0].id}` });
}));
r.get('/media/:id', wrap(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).end();
  const q = await pool.query('select mime,data,name from media where id=$1', [req.params.id]);
  if (!q.rowCount) return res.status(404).end();
  const { mime, data, name } = q.rows[0];
  const h = { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' };
  if (req.query.download) h['Content-Disposition'] = `attachment; filename="${name || (mime === 'application/pdf' ? 'CV.pdf' : 'file')}"`; // forces a real download
  res.set(h).send(data);
}));

/* ---------- admin auth (5 wrong attempts / 15 min / IP => locked) ---------- */
r.post('/admin/login', wrap(async (req, res) => {
  const { ADMIN_CODE, JWT_SECRET } = process.env;
  if (!ADMIN_CODE || !JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });
  const ip = ipOf(req);
  const { rows } = await pool.query("select count(*)::int c from login_attempts where ip=$1 and created_at > now() - interval '15 minutes'", [ip]);
  if (rows[0].c >= 5) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  if (!same(String(req.body.code || ''), ADMIN_CODE)) {
    await pool.query('insert into login_attempts(ip) values($1)', [ip]);
    await pool.query("delete from login_attempts where created_at < now() - interval '1 day'");
    await new Promise((ok) => setTimeout(ok, 700));
    return res.status(401).json({ error: 'Wrong access code' });
  }
  await pool.query('delete from login_attempts where ip=$1', [ip]);
  res.json({ token: jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' }) });
}));
r.get('/admin/verify', auth, (req, res) => res.json({ ok: true }));
r.get('/admin/stats', auth, wrap(async (req, res) => {
  const q = await pool.query("select (select count(*)::int from projects) projects, (select count(*)::int from skills) skills, (select count(*)::int from experiences) experiences, (select count(*)::int from messages) messages, (select count(*)::int from messages where not read) unread");
  res.json(q.rows[0]);
}));

/* ---------- admin CMS ---------- */
r.put('/settings', auth, wrap(async (req, res) => {
  const clean = {};
  for (const k of Object.keys(defaults.settings)) if (k in req.body) clean[k] = req.body[k];
  const next = { ...(await getSettings()), ...clean };
  await pool.query("insert into settings(key,value) values('site',$1) on conflict(key) do update set value=excluded.value", [JSON.stringify(next)]);
  res.json(next);
}));

r.post('/projects/reorder', auth, wrap(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  for (const [i, id] of ids.entries()) await pool.query('update projects set position=$1 where id=$2', [i, id]);
  res.json({ ok: true });
}));
r.post('/projects', auth, wrap(async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'title required' });
  const q = await pool.query('insert into projects(title,subtitle,description,tags,live_url,repo_url,image_url,icon,featured,position) values($1,$2,$3,$4,$5,$6,$7,$8,$9,(select coalesce(max(position),0)+1 from projects)) returning *', projectArgs(req.body));
  res.status(201).json(q.rows[0]);
}));
r.put('/projects/:id', auth, wrap(async (req, res) => {
  const q = await pool.query('update projects set title=$1,subtitle=$2,description=$3,tags=$4,live_url=$5,repo_url=$6,image_url=$7,icon=$8,featured=$9 where id=$10 returning *', [...projectArgs(req.body), req.params.id]);
  res.json(q.rows[0] || null);
}));
r.delete('/projects/:id', auth, wrap(async (req, res) => { await pool.query('delete from projects where id=$1', [req.params.id]); res.json({ ok: true }); }));

r.post('/experiences', auth, wrap(async (req, res) => {
  if (!req.body.company || !req.body.role) return res.status(400).json({ error: 'company and designation required' });
  res.status(201).json((await pool.query('insert into experiences(company,logo_url,role,emp_type,location,work_mode,start_date,end_date,current,description,tech,url) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *', expArgs(req.body))).rows[0]);
}));
r.put('/experiences/:id', auth, wrap(async (req, res) => res.json((await pool.query('update experiences set company=$1,logo_url=$2,role=$3,emp_type=$4,location=$5,work_mode=$6,start_date=$7,end_date=$8,current=$9,description=$10,tech=$11,url=$12 where id=$13 returning *', [...expArgs(req.body), req.params.id])).rows[0] || null)));
r.delete('/experiences/:id', auth, wrap(async (req, res) => { await pool.query('delete from experiences where id=$1', [req.params.id]); res.json({ ok: true }); }));

const skillArgs = (b) => [str(b.name, 80), Math.min(100, Math.max(0, parseInt(b.level, 10) || 0)), str(b.category || 'Other', 60)];
r.post('/skills', auth, wrap(async (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name required' });
  res.status(201).json((await pool.query('insert into skills(name,level,category) values($1,$2,$3) returning *', skillArgs(req.body))).rows[0]);
}));
r.put('/skills/:id', auth, wrap(async (req, res) => res.json((await pool.query('update skills set name=$1,level=$2,category=$3 where id=$4 returning *', [...skillArgs(req.body), req.params.id])).rows[0] || null)));
r.delete('/skills/:id', auth, wrap(async (req, res) => { await pool.query('delete from skills where id=$1', [req.params.id]); res.json({ ok: true }); }));

r.get('/messages', auth, wrap(async (req, res) => res.json((await pool.query('select * from messages order by id desc')).rows)));
r.patch('/messages/:id', auth, wrap(async (req, res) => { await pool.query('update messages set read=$1 where id=$2', [req.body.read !== false, req.params.id]); res.json({ ok: true }); }));
r.delete('/messages/:id', auth, wrap(async (req, res) => { await pool.query('delete from messages where id=$1', [req.params.id]); res.json({ ok: true }); }));

app.use('/api', r);
app.use('/', r);
app.use((e, req, res, next) => { console.error(e); res.status(500).json({ error: 'Server error' }); });
module.exports = app;

