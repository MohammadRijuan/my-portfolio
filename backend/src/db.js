const { Pool } = require('pg');
const defaults = require('./defaults.json');

function clean(s) {
  if (!s) return s;
  const u = new URL(s);
  u.searchParams.delete('channel_binding'); // not supported by node-postgres
  return u.toString();
}
const pool = new Pool({ connectionString: clean(process.env.DATABASE_URL), max: 3 });

async function getSettings() {
  const { rows } = await pool.query("select value from settings where key='site'");
  return { ...defaults.settings, ...(rows[0] ? rows[0].value : {}) };
}

let ready;
function init() {
  if (!ready) ready = (async () => {
    await pool.query(`
      create table if not exists projects(id serial primary key, title text not null, subtitle text default '', description text default '', tags text[] default '{}', live_url text default '', repo_url text default '', image_url text default '', icon text default 'code', featured boolean default true, position int default 0, created_at timestamptz default now());
      alter table projects add column if not exists image_url text default '';
      alter table projects add column if not exists featured boolean default true;
      create table if not exists skills(id serial primary key, name text not null, level int default 80, category text default 'Other');
      create table if not exists messages(id serial primary key, name text, email text, message text, read boolean default false, created_at timestamptz default now());
      alter table messages add column if not exists read boolean default false;
      alter table messages add column if not exists notified boolean default false;
      alter table messages add column if not exists ip text;
      create table if not exists media(id serial primary key, mime text not null, data bytea not null, created_at timestamptz default now());
      alter table media add column if not exists name text;
      create table if not exists experiences(id serial primary key, company text not null, logo_url text default '', role text not null, emp_type text default 'Full-time', location text default '', work_mode text default '', start_date text default '', end_date text default '', current boolean default false, description text default '', tech text[] default '{}', url text default '', created_at timestamptz default now());
      create table if not exists email_otps(id serial primary key, email text not null, code_hash text not null, attempts int default 0, ip text, created_at timestamptz default now(), expires_at timestamptz not null);
      create table if not exists settings(key text primary key, value jsonb not null);
      create table if not exists login_attempts(id serial primary key, ip text, created_at timestamptz default now());`);
    if ((await pool.query('select 1 from projects limit 1')).rowCount === 0)
      for (const [i, p] of defaults.projects.entries())
        await pool.query('insert into projects(title,subtitle,description,tags,icon,live_url,repo_url,image_url,featured,position) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [p.title, p.subtitle, p.description, p.tags, p.icon, p.live_url, p.repo_url, p.image_url, p.featured, i]);
    if ((await pool.query('select 1 from skills limit 1')).rowCount === 0)
      for (const s of defaults.skills) await pool.query('insert into skills(name,level,category) values($1,$2,$3)', [s.name, s.level, s.category]);
    await pool.query("insert into settings(key,value) values('site',$1) on conflict do nothing", [JSON.stringify(defaults.settings)]);
  })().catch((e) => { ready = null; throw e; });
  return ready;
}
module.exports = { pool, init, getSettings, defaults };
