'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, SlidersHorizontal, FolderKanban, Sparkles, Mail, LogOut, Lock, Plus, Trash2, ArrowUp, ArrowDown, Pencil, ExternalLink, X, Save, Eye, EyeOff, UploadCloud, Briefcase, Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import { API, Experience, Project, Skill, Settings, defaultSettings, img } from '@/lib/data';
import { icons } from '@/components/Icon';
import { THEMES, BRANDS, applyTheme, rgbToHex } from '@/lib/theme';

type Msg = { id: number; name: string; email: string; message: string; read: boolean; notified: boolean; created_at: string };
type Stats = { projects: number; skills: number; experiences: number; messages: number; unread: number };
type Sec = 'dashboard' | 'settings' | 'theme' | 'projects' | 'skills' | 'experience' | 'messages';

const inp = 'w-full rounded-xl bg-white/[.04] border border-accent/20 px-4 py-2.5 text-sm outline-none focus:border-accent focus:bg-accent/5 transition placeholder:text-mute/60';
const btn = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50';
const primary = `${btn} bg-gradient-to-r from-accent to-accent2 text-black shadow-[0_0_24px_rgb(var(--accent)/.3)]`;
const ghost = `${btn} glass !rounded-xl`;

function Field({ label, value, onChange, area = false, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; area?: boolean; type?: string }) {
  return (
    <label className="block"><span className="text-xs text-mute mb-1.5 block">{label}</span>
      {area ? <textarea rows={4} className={inp} value={value} onChange={(e) => onChange(e.target.value)} /> : <input type={type} className={inp} value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return <section className="glass p-5 sm:p-6"><div className="flex items-center justify-between mb-5"><h3 className="font-semibold">{title}</h3>{right}</div>{children}</section>;
}
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <label className="block"><span className="text-xs text-mute mb-1.5 block">{label}</span><select className={inp} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o} className="text-black">{o}</option>)}</select></label>;
}
const TokenCtx = createContext('');
const ToastCtx = createContext<(m: string, t?: 'ok' | 'err') => void>(() => {});
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file), k = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not process image'))), 'image/webp', 0.86));
}
/** Drag & drop (or click to choose) image upload. Stores the file in the database and returns its path. */
function ImageDrop({ label, value, onChange, kind = 'image', name }: { label: string; value: string; onChange: (v: string, meta?: { name: string; size: number }) => void; kind?: 'image' | 'pdf'; name?: string }) {
  const token = useContext(TokenCtx), flash = useContext(ToastCtx), pdf = kind === 'pdf';
  const [blobUrl, setBlobUrl] = useState(''), [size, setSize] = useState('');
  useEffect(() => {
    if (!pdf || !value) { setBlobUrl(''); return; }
    let url = '', dead = false;
    fetch(img(value)).then((r) => r.blob()).then((b) => {
      if (dead) return;
      url = URL.createObjectURL(b); setBlobUrl(url);
      setSize(b.size > 1048576 ? `${(b.size / 1048576).toFixed(1)} MB` : `${Math.round(b.size / 1024)} KB`);
    }).catch(() => {});
    return () => { dead = true; if (url) URL.revokeObjectURL(url); };
  }, [value, pdf]);
  const [over, setOver] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const pick = async (file?: File) => {
    if (!file || (pdf ? file.type !== 'application/pdf' : !file.type.startsWith('image/'))) return setErr(pdf ? 'Please choose a PDF file' : 'Please choose an image file');
    if (pdf && file.size > 4 * 1024 * 1024) return setErr('PDF must be under 4MB');
    setBusy(true); setErr('');
    try {
      const blob: Blob = pdf ? file : await shrink(file);
      const r = await fetch(`${API}/api/upload`, { method: 'POST', headers: { 'Content-Type': blob.type, 'X-File-Name': encodeURIComponent(file.name), Authorization: `Bearer ${token}` }, body: blob });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Upload failed');
      onChange(d.url, { name: file.name, size: file.size }); flash(pdf ? 'CV uploaded successfully' : 'Image uploaded successfully');
    } catch (e: any) { setErr(e.message || 'Upload failed'); flash(e.message || 'Upload failed', 'err'); }
    setBusy(false);
  };
  return (
    <div>
      <span className="text-xs text-mute mb-1.5 block">{label}</span>
      <label onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
        className={`relative flex items-center justify-center gap-4 cursor-pointer rounded-xl border-2 border-dashed p-4 min-h-[120px] transition ${over ? 'border-accent bg-accent/10 scale-[1.01]' : 'border-accent/25 hover:border-accent/60 hover:bg-white/[.03]'}`}>
        {value && !pdf && <img src={img(value)} alt="" className="h-24 w-24 object-cover rounded-lg border border-accent/30" />}
        <span className="text-center text-sm text-mute"><UploadCloud className="mx-auto mb-1 text-accent" />{busy ? 'Uploading…' : value ? 'Drop or click to replace' : pdf ? 'Drop your PDF here or click to choose' : 'Drop an image here or click to choose'}</span>
        <input type="file" accept={pdf ? 'application/pdf' : 'image/*'} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      </label>
      {pdf && value && (
        <div className="mt-3 rounded-xl border border-accent/25 overflow-hidden bg-white/[.03]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm border-b border-accent/15">
            <span className="truncate">📄 {name || 'CV.pdf'}{size && <span className="text-mute"> · {size}</span>}</span><span className="chip shrink-0">uploaded ✓</span>
          </div>
          {blobUrl ? <iframe src={`${blobUrl}#toolbar=0&view=FitH`} title="CV preview" className="w-full h-72 bg-white" /> : <div className="h-24 grid place-items-center text-xs text-mute">Loading preview…</div>}
        </div>
      )}
      {value && <button type="button" onClick={() => onChange('')} className="text-xs text-red-400 mt-2">Remove {pdf ? 'file' : 'image'}</button>}
      {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
    </div>
  );
}
type LField<T> = { key: keyof T & string; label: string; options?: string[]; image?: boolean };
function ListEditor<T extends Record<string, string>>({ items, fields, blank, onChange }: { items: T[]; fields: LField<T>[]; blank: T; onChange: (v: T[]) => void }) {
  const set = (i: number, k: string, v: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="grid sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))_auto] gap-3 items-end p-3 rounded-xl bg-white/[.02] border border-accent/10">
          {fields.map((f) => f.image
            ? <div key={f.key} className="sm:col-span-full"><ImageDrop label={f.label} value={it[f.key]} onChange={(v) => set(i, f.key, v)} /></div>
            : f.options
              ? <Select key={f.key} label={f.label} value={it[f.key]} options={f.options} onChange={(v) => set(i, f.key, v)} />
              : <Field key={f.key} label={f.label} value={it[f.key]} onChange={(v) => set(i, f.key, v)} />)}
          <button className={`${ghost} !text-red-400`} onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 size={14} /></button>
        </div>
      ))}
      <button className={ghost} onClick={() => onChange([...items, { ...blank }])}><Plus size={14} /> Add</button>
    </div>
  );
}

const blankProject = { title: '', subtitle: '', description: '', tags: '', live_url: '', repo_url: '', image_url: '', icon: 'code', featured: true };
const blankExp = { company: '', logo_url: '', role: '', emp_type: 'Full-time', location: '', work_mode: 'On-site', start_date: '', end_date: '', current: false, description: '', tech: '', url: '' };
const nav: [Sec, string, typeof Mail][] = [['dashboard', 'Dashboard', LayoutDashboard], ['settings', 'Site content', SlidersHorizontal], ['theme', 'Theme', Palette], ['projects', 'Projects', FolderKanban], ['skills', 'Skills', Sparkles], ['experience', 'Experience', Briefcase], ['messages', 'Messages', Mail]];

export default function Admin() {
  const [token, setToken] = useState(''), [ready, setReady] = useState(false), [code, setCode] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [showCode, setShowCode] = useState(false);
  const [sec, setSec] = useState<Sec>('dashboard');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'ok' | 'err' }[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [projects, setP] = useState<Project[]>([]), [skills, setS] = useState<Skill[]>([]), [msgs, setM] = useState<Msg[]>([]), [stats, setStats] = useState<Stats | null>(null);
  const [pf, setPf] = useState<any>(null), [sf, setSf] = useState<any>(null);
  const [exps, setE] = useState<Experience[]>([]), [ef, setEf] = useState<any>(null);

  useEffect(() => { setToken(sessionStorage.getItem('adm') || ''); setReady(true); }, []);
  const flash = (m: string, type?: 'ok' | 'err') => {
    const id = Date.now() + Math.random(), ty = type || (/fail|error|cannot|wrong|unsupported|must|too many/i.test(m) ? 'err' : 'ok');
    setToasts((a) => [...a.slice(-3), { id, msg: m, type: ty }]);
    setTimeout(() => setToasts((a) => a.filter((x) => x.id !== id)), 3500);
  };
  const logout = () => { sessionStorage.removeItem('adm'); setToken(''); };
  const call = useCallback(async (path: string, method = 'GET', body?: unknown) => {
    try {
      const r = await fetch(`${API}/api${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
      if (r.status === 401) { logout(); return null; }
      return r.ok ? r.json() : null;
    } catch { return null; }
  }, [token]);
  const load = useCallback(async () => {
    const [site, m, st] = await Promise.all([call('/site'), call('/messages'), call('/admin/stats')]);
    if (site) { setSettings({ ...defaultSettings, ...site.settings }); setP(site.projects); setS(site.skills); setE(site.experiences || []); }
    m && setM(m); st && setStats(st);
  }, [call]);
  useEffect(() => { if (token) load(); }, [token, load]);

  const login = async () => {
    setErr(''); setBusy(true);
    try {
      const r = await fetch(`${API}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const d = await r.json();
      if (!r.ok) setErr(d.error || 'Failed'); else { sessionStorage.setItem('adm', d.token); setToken(d.token); setCode(''); }
    } catch { setErr('Cannot reach the API'); }
    setBusy(false);
  };
  const upd = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((o) => ({ ...o, [k]: v }));
  const resetTheme = () => setSettings((o) => ({ ...o, theme_preset: 'emerald-night', brand_preset: 'emerald', brand_a: '#34e89c', brand_b: '#14b8a6', default_mode: 'dark' }));
  useEffect(() => { if (token) applyTheme(settings, false); }, [token, settings.theme_preset, settings.brand_preset, settings.brand_a, settings.brand_b]);
  const saveSettings = async () => { const r = await call('/settings', 'PUT', settings); flash(r ? 'Changes saved successfully' : 'Save failed — please try again'); };
  const saveProject = async () => {
    const r = pf.id ? await call(`/projects/${pf.id}`, 'PUT', pf) : await call('/projects', 'POST', pf);
    flash(r ? 'Project saved' : 'Save failed'); if (r) { setPf(null); load(); }
  };
  const move = async (i: number, dir: number) => {
    const a = [...projects], j = i + dir; if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; setP(a); await call('/projects/reorder', 'POST', { ids: a.map((p) => p.id) });
  };
  const saveSkill = async () => { const r = sf.id ? await call(`/skills/${sf.id}`, 'PUT', sf) : await call('/skills', 'POST', sf); flash(r ? 'Skill saved' : 'Save failed'); if (r) { setSf(null); load(); } };
  const saveExp = async () => { const r = ef.id ? await call(`/experiences/${ef.id}`, 'PUT', ef) : await call('/experiences', 'POST', ef); flash(r ? 'Experience saved' : 'Save failed'); if (r) { setEf(null); load(); } };
  const del = async (kind: string, id: number) => { if (!confirm('Delete this item?')) return; await call(`/${kind}/${id}`, 'DELETE'); flash('Deleted'); load(); };

  if (!ready) return null;
  if (!token) return (
    <div className="fixed inset-0 z-10 grid place-items-center p-5">
      <div className="glass p-8 w-full max-w-sm text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/15 grid place-items-center text-accent shadow-[0_0_30px_rgb(var(--accent)/.3)]"><Lock /></div>
        <h1 className="mt-5 text-2xl font-bold">Private CMS</h1><p className="text-sm text-mute mt-1">Enter your access code to continue</p>
        <div className="relative mt-6">
          <input type={showCode ? 'text' : 'password'} autoFocus value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="Access code" className={`${inp} text-center px-11`} />
          <button type="button" onClick={() => setShowCode(!showCode)} aria-label={showCode ? 'Hide code' : 'Show code'} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-accent transition">{showCode ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        <button onClick={login} disabled={busy || !code} className={`${primary} w-full justify-center mt-5`}>{busy ? 'Checking…' : 'Unlock'}</button>
        <Link href="/" className="block mt-5 text-xs text-mute hover:text-accent">← Back to site</Link>
      </div>
    </div>
  );

  return (
    <TokenCtx.Provider value={token}><ToastCtx.Provider value={flash}>
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-[1440px]">
        <aside className="hidden md:flex sticky top-0 self-start h-screen w-64 shrink-0 flex-col p-5 border-r border-accent/10 bg-bg/40 backdrop-blur-xl">
          <div className="text-lg font-bold mb-8">CMS <span className="text-accent">Studio</span></div>
          <nav className="space-y-1.5 flex-1">
            {nav.map(([id, label, I]) => (
              <button key={id} onClick={() => setSec(id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${sec === id ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgb(var(--accent)/.3)]' : 'text-fg/75 hover:bg-white/5 hover:translate-x-1'}`}>
                <I size={17} />{label}{id === 'messages' && !!stats?.unread && <span className="ml-auto text-[10px] bg-accent text-black rounded-full px-2 py-0.5">{stats.unread}</span>}
              </button>
            ))}
          </nav>
          <Link href="/" target="_blank" className={`${ghost} justify-center`}><Eye size={15} /> View site</Link>
          <button onClick={logout} className={`${ghost} justify-center mt-2 !text-red-400`}><LogOut size={15} /> Log out</button>
        </aside>

        <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 pb-28 md:pb-10 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">{nav.find((n) => n[0] === sec)![1]}</h1>
            <div className="flex gap-2 md:hidden"><Link href="/" className={ghost}><Eye size={15} /></Link><button onClick={logout} className={`${ghost} !text-red-400`}><LogOut size={15} /></button></div>
          </div>

          {sec === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[['Projects', stats?.projects], ['Skills', stats?.skills], ['Experience', stats?.experiences], ['Messages', stats?.messages], ['Unread', stats?.unread]].map(([l, v]) => (
                  <div key={l as string} className="glass p-5"><div className="text-3xl font-bold text-accent">{v ?? '–'}</div><div className="text-xs text-mute mt-1">{l}</div></div>
                ))}
              </div>
              <Panel title="Quick actions"><div className="flex flex-wrap gap-3">
                <button className={primary} onClick={() => setSec('settings')}><SlidersHorizontal size={15} /> Edit site content</button>
                <button className={ghost} onClick={() => { setSec('projects'); setPf({ ...blankProject }); }}><Plus size={15} /> New project</button>
                <button className={ghost} onClick={() => setSec('messages')}><Mail size={15} /> Read messages</button>
              </div></Panel>
            </div>
          )}

          {sec === 'settings' && (
            <div className="space-y-6">
              <div className="sticky top-3 z-20 flex justify-end"><button className={primary} onClick={saveSettings}><Save size={15} /> Save changes</button></div>
              <Panel title="Hero">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Logo text" value={settings.logo_text} onChange={(v) => upd('logo_text', v)} />
                  <Field label="Greeting badge" value={settings.badge} onChange={(v) => upd('badge', v)} />
                  <Field label="Name (white part)" value={settings.name_main} onChange={(v) => upd('name_main', v)} />
                  <Field label="Name (green part)" value={settings.name_accent} onChange={(v) => upd('name_accent', v)} />
                  <Field label="Role" value={settings.role} onChange={(v) => upd('role', v)} />
                  <Field label="Main button label" value={settings.cta_label} onChange={(v) => upd('cta_label', v)} />
                  <Field label="CV button label" value={settings.cv_label} onChange={(v) => upd('cv_label', v)} />
                </div>
                <div className="mt-4"><Field label="Tagline" area value={settings.tagline} onChange={(v) => upd('tagline', v)} /></div>
                <div className="mt-6"><ImageDrop kind="pdf" label="CV (PDF) — drop a file or choose one. The Download CV button downloads it directly (no link to share)." value={settings.cv_url} name={settings.cv_name} onChange={(v, m) => { upd('cv_url', v); upd('cv_name', m ? m.name : ''); }} /></div>
                <h4 className="text-sm text-mute mt-6 mb-1">Icon links under the intro (empty URL = hidden)</h4>
                <p className="text-xs text-mute mb-3">Use https://… for GitHub / LinkedIn, or #contact (or #projects, #about …) to jump to a page of this site.</p>
                <ListEditor items={settings.hero_links} blank={{ icon: 'globe', label: '', url: '' }} onChange={(v) => upd('hero_links', v)} fields={[{ key: 'icon', label: 'Icon', options: Object.keys(icons) }, { key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }]} />
              </Panel>
              <Panel title="Pages & SEO">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Browser title (SEO)" value={settings.site_title} onChange={(v) => upd('site_title', v)} />
                  <Field label="Meta description (SEO)" value={settings.site_description} onChange={(v) => upd('site_description', v)} />
                </div>
                <h4 className="text-sm text-mute mt-6 mb-3">Show these pages</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {['about', 'projects', 'skills', 'experience', 'contact'].map((id) => {
                    const hid = settings.hidden_pages.split(',').includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 text-sm capitalize"><input type="checkbox" className="accent-[rgb(var(--accent))] w-4 h-4" checked={!hid}
                        onChange={(e) => { const s = new Set(settings.hidden_pages.split(',').filter(Boolean)); if (e.target.checked) s.delete(id); else s.add(id); upd('hidden_pages', Array.from(s).join(',')); }} />{id}</label>
                    );
                  })}
                </div>
              </Panel>
              <Panel title="Developer card"><div className="grid sm:grid-cols-2 gap-4">
                <Field label="name" value={settings.code_name} onChange={(v) => upd('code_name', v)} />
                <Field label="passion" value={settings.code_passion} onChange={(v) => upd('code_passion', v)} />
                <Field label="location" value={settings.code_location} onChange={(v) => upd('code_location', v)} />
                <Field label="footer comment" value={settings.code_footer} onChange={(v) => upd('code_footer', v)} />
              </div></Panel>
              <Panel title="About">
                <Field label="About text" area value={settings.about_text} onChange={(v) => upd('about_text', v)} />
                <div className="mt-6"><ImageDrop label="Your photo (opens in a lightbox on the About page)" value={settings.profile_image} onChange={(v) => upd('profile_image', v)} /></div>
                <h4 className="text-sm text-mute mt-6 mb-3">Certifications</h4>
                <ListEditor items={settings.certifications} blank={{ title: '', image: '' }} onChange={(v) => upd('certifications', v)} fields={[{ key: 'title', label: 'Title' }, { key: 'image', label: 'Certificate image', image: true }]} />
                <h4 className="text-sm text-mute mt-6 mb-3">Quick facts</h4>
                <ListEditor items={settings.facts} blank={{ icon: 'code', title: '', sub: '' }} onChange={(v) => upd('facts', v)} fields={[{ key: 'icon', label: 'Icon', options: Object.keys(icons) }, { key: 'title', label: 'Title' }, { key: 'sub', label: 'Subtitle' }]} />
                <h4 className="text-sm text-mute mt-6 mb-3">What I do</h4>
                <ListEditor items={settings.services} blank={{ icon: 'code', title: '', text: '' }} onChange={(v) => upd('services', v)} fields={[{ key: 'icon', label: 'Icon', options: Object.keys(icons) }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text' }]} />
              </Panel>
              <Panel title="Contact & social">
                <div className="grid sm:grid-cols-2 gap-4"><Field label="Gmail address (shown on Contact page)" value={settings.contact_email} onChange={(v) => upd('contact_email', v)} /><Field label="WhatsApp number (with country code, e.g. +8801XXXXXXXXX)" value={settings.contact_whatsapp} onChange={(v) => upd('contact_whatsapp', v)} /><Field label="Contact text" value={settings.contact_text} onChange={(v) => upd('contact_text', v)} /></div>
                <h4 className="text-sm text-mute mt-6 mb-3">Social links (empty URL = hidden)</h4>
                <ListEditor items={settings.socials} blank={{ icon: 'globe', label: '', url: '' }} onChange={(v) => upd('socials', v)} fields={[{ key: 'icon', label: 'Icon', options: Object.keys(icons) }, { key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }]} />
              </Panel>
            </div>
          )}

          {sec === 'theme' && (
            <div className="space-y-6">
              <div className="sticky top-3 z-20 flex justify-end gap-3"><button className={ghost} onClick={resetTheme}>Reset to default</button><button className={primary} onClick={saveSettings}><Save size={15} /> Save theme</button></div>
              <Panel title="Theme — background & surfaces">
                <p className="text-xs text-mute mb-4">Changes preview live on this page. Dark and light modes both follow the chosen theme.</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {THEMES.map((th) => (
                    <button key={th.id} onClick={() => upd('theme_preset', th.id)} className={`text-left rounded-2xl p-3 border transition hover:-translate-y-1 ${settings.theme_preset === th.id ? 'border-accent shadow-[0_0_25px_rgb(var(--accent)/.35)]' : 'border-accent/15'}`}>
                      <div className="rounded-xl p-2.5 h-24" style={{ background: `rgb(${th.dark.bg})` }}>
                        <div className="h-full rounded-lg p-2 flex flex-col gap-1.5" style={{ background: `rgb(${th.dark.card})` }}>
                          <span className="h-2 w-2/3 rounded" style={{ background: `rgb(${th.dark.fg})` }} />
                          <span className="h-1.5 w-1/2 rounded" style={{ background: `rgb(${th.dark.mute})` }} />
                          <span className="mt-auto h-3 w-10 rounded-full bg-accent" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm">{th.name}</div>
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel title="Brand colors">
                <div className="flex flex-wrap gap-4">
                  {BRANDS.map((b) => (
                    <button key={b.id} onClick={() => upd('brand_preset', b.id)} className="group text-center w-24">
                      <span className={`block mx-auto w-14 h-14 rounded-full border-2 transition group-hover:scale-110 ${settings.brand_preset === b.id ? 'border-fg scale-110 shadow-[0_0_25px_rgb(var(--accent)/.5)]' : 'border-transparent'}`} style={{ background: `linear-gradient(135deg, rgb(${b.a}), rgb(${b.b}))` }} />
                      <span className="block mt-2 text-xs text-mute">{b.name}</span>
                    </button>
                  ))}
                  <button onClick={() => setSettings((o) => { const c = BRANDS.find((x) => x.id === o.brand_preset); return { ...o, brand_preset: 'custom', ...(c ? { brand_a: rgbToHex(c.a), brand_b: rgbToHex(c.b) } : {}) }; })} className="group text-center w-24">
                    <span className={`block mx-auto w-14 h-14 rounded-full border-2 transition group-hover:scale-110 ${settings.brand_preset === 'custom' ? 'border-fg scale-110' : 'border-transparent'}`} style={{ background: 'conic-gradient(#f43f5e,#f59e0b,#22c55e,#06b6d4,#6366f1,#d946ef,#f43f5e)' }} />
                    <span className="block mt-2 text-xs text-mute">Custom</span>
                  </button>
                </div>
                {settings.brand_preset === 'custom' && (
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    {([['brand_a', 'Primary color'], ['brand_b', 'Secondary color']] as const).map(([k, l]) => (
                      <label key={k} className="block"><span className="text-xs text-mute mb-1.5 block">{l}</span>
                        <input type="color" value={settings[k]} onChange={(e) => upd(k, e.target.value)} className="w-full h-12 rounded-xl bg-transparent border border-accent/20 cursor-pointer" /></label>
                    ))}
                  </div>
                )}
              </Panel>
              <Panel title="Default mode for new visitors">
                <Select label="Visitors can still switch with the Dark / Light button" value={settings.default_mode} options={['dark', 'light']} onChange={(v) => upd('default_mode', v)} />
              </Panel>
            </div>
          )}

          {sec === 'projects' && (
            <div className="space-y-4">
              {pf ? (
                <Panel title={pf.id ? 'Edit project' : 'New project'} right={<button onClick={() => setPf(null)} aria-label="Close"><X size={18} /></button>}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Title" value={pf.title} onChange={(v) => setPf({ ...pf, title: v })} />
                    <Field label="Subtitle" value={pf.subtitle} onChange={(v) => setPf({ ...pf, subtitle: v })} />
                    <Field label="Live URL" value={pf.live_url} onChange={(v) => setPf({ ...pf, live_url: v })} />
                    <Field label="Repository URL" value={pf.repo_url} onChange={(v) => setPf({ ...pf, repo_url: v })} />
                    <div className="sm:col-span-2"><ImageDrop label="Project image (optional)" value={pf.image_url} onChange={(v) => setPf({ ...pf, image_url: v })} /></div>
                    <Field label="Tags (comma separated)" value={Array.isArray(pf.tags) ? pf.tags.join(', ') : pf.tags} onChange={(v) => setPf({ ...pf, tags: v })} />
                    <Select label="Icon" value={pf.icon} options={Object.keys(icons)} onChange={(v) => setPf({ ...pf, icon: v })} />
                    <label className="flex items-center gap-3 text-sm mt-6"><input type="checkbox" className="accent-[rgb(var(--accent))] w-4 h-4" checked={pf.featured} onChange={(e) => setPf({ ...pf, featured: e.target.checked })} /> Show on homepage</label>
                  </div>
                  <div className="mt-4"><Field label="Description" area value={pf.description} onChange={(v) => setPf({ ...pf, description: v })} /></div>
                  <div className="mt-5 flex gap-3"><button className={primary} onClick={saveProject} disabled={!pf.title}><Save size={15} /> Save</button><button className={ghost} onClick={() => setPf(null)}>Cancel</button></div>
                </Panel>
              ) : <button className={primary} onClick={() => setPf({ ...blankProject })}><Plus size={15} /> New project</button>}
              {projects.map((p, i) => (
                <div key={p.id} className="glass p-4 flex items-center gap-3">
                  <div className="flex flex-col"><button onClick={() => move(i, -1)} className="hover:text-accent" aria-label="Up"><ArrowUp size={15} /></button><button onClick={() => move(i, 1)} className="hover:text-accent" aria-label="Down"><ArrowDown size={15} /></button></div>
                  <div className="min-w-0 flex-1"><div className="font-medium truncate">{p.title} {p.featured && <span className="chip ml-2">home</span>}</div><div className="text-xs text-mute truncate">{p.subtitle}</div></div>
                  {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-mute hover:text-accent"><ExternalLink size={16} /></a>}
                  <button className={ghost} onClick={() => setPf({ ...p })}><Pencil size={14} /></button>
                  <button className={`${ghost} !text-red-400`} onClick={() => del('projects', p.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {sec === 'skills' && (
            <div className="space-y-4">
              {sf ? (
                <Panel title={sf.id ? 'Edit skill' : 'New skill'} right={<button onClick={() => setSf(null)} aria-label="Close"><X size={18} /></button>}>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Name" value={sf.name} onChange={(v) => setSf({ ...sf, name: v })} />
                    <Field label="Level (0-100)" type="number" value={sf.level} onChange={(v) => setSf({ ...sf, level: v })} />
                    <Field label="Category" value={sf.category} onChange={(v) => setSf({ ...sf, category: v })} />
                  </div>
                  <div className="mt-5 flex gap-3"><button className={primary} onClick={saveSkill} disabled={!sf.name}><Save size={15} /> Save</button><button className={ghost} onClick={() => setSf(null)}>Cancel</button></div>
                </Panel>
              ) : <button className={primary} onClick={() => setSf({ name: '', level: 80, category: 'Languages' })}><Plus size={15} /> New skill</button>}
              <div className="grid sm:grid-cols-2 gap-3">
                {skills.map((s) => (
                  <div key={s.id} className="glass p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0"><div className="truncate">{s.name} <span className="text-mute text-xs">· {s.category}</span></div>
                      <div className="h-1.5 mt-2 rounded-full bg-accent/15 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${s.level}%` }} /></div></div>
                    <button className={ghost} onClick={() => setSf({ ...s })}><Pencil size={14} /></button>
                    <button className={`${ghost} !text-red-400`} onClick={() => del('skills', s.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sec === 'experience' && (
            <div className="space-y-4">
              {ef ? (
                <Panel title={ef.id ? 'Edit experience' : 'New experience'} right={<button onClick={() => setEf(null)} aria-label="Close"><X size={18} /></button>}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Company name" value={ef.company} onChange={(v) => setEf({ ...ef, company: v })} />
                    <Field label="Designation / role" value={ef.role} onChange={(v) => setEf({ ...ef, role: v })} />
                    <Select label="Employment type" value={ef.emp_type} options={['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract']} onChange={(v) => setEf({ ...ef, emp_type: v })} />
                    <Select label="Work mode" value={ef.work_mode} options={['On-site', 'Remote', 'Hybrid']} onChange={(v) => setEf({ ...ef, work_mode: v })} />
                    <Field label="Location" value={ef.location} onChange={(v) => setEf({ ...ef, location: v })} />
                    <Field label="Company website" value={ef.url} onChange={(v) => setEf({ ...ef, url: v })} />
                    <Field label="Start month" type="month" value={ef.start_date} onChange={(v) => setEf({ ...ef, start_date: v })} />
                    {ef.current ? <div /> : <Field label="End month" type="month" value={ef.end_date} onChange={(v) => setEf({ ...ef, end_date: v })} />}
                    <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" className="accent-[rgb(var(--accent))] w-4 h-4" checked={ef.current} onChange={(e) => setEf({ ...ef, current: e.target.checked })} /> I currently work here (shows “Present”)</label>
                    <div className="sm:col-span-2"><ImageDrop label="Company logo" value={ef.logo_url} onChange={(v) => setEf({ ...ef, logo_url: v })} /></div>
                    <div className="sm:col-span-2"><Field label="Responsibilities & achievements (one per line)" area value={ef.description} onChange={(v) => setEf({ ...ef, description: v })} /></div>
                    <div className="sm:col-span-2"><Field label="Tech stack used (comma separated)" value={Array.isArray(ef.tech) ? ef.tech.join(', ') : ef.tech} onChange={(v) => setEf({ ...ef, tech: v })} /></div>
                  </div>
                  <div className="mt-5 flex gap-3"><button className={primary} onClick={saveExp} disabled={!ef.company || !ef.role}><Save size={15} /> Save</button><button className={ghost} onClick={() => setEf(null)}>Cancel</button></div>
                </Panel>
              ) : <button className={primary} onClick={() => setEf({ ...blankExp })}><Plus size={15} /> New experience</button>}
              {exps.map((e) => (
                <div key={e.id} className="glass p-4 flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl border border-accent/25 overflow-hidden grid place-items-center bg-white/5">{e.logo_url ? <img src={img(e.logo_url)} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={18} className="text-accent" />}</div>
                  <div className="min-w-0 flex-1"><div className="font-medium truncate">{e.role} {e.current && <span className="chip ml-2">present</span>}</div><div className="text-xs text-mute truncate">{e.company} · {e.start_date || '—'} → {e.current ? 'Present' : e.end_date || '—'}</div></div>
                  <button className={ghost} onClick={() => setEf({ ...e })}><Pencil size={14} /></button>
                  <button className={`${ghost} !text-red-400`} onClick={() => del('experiences', e.id)}><Trash2 size={14} /></button>
                </div>
              ))}
              {exps.length === 0 && !ef && <p className="text-mute">No experience added yet.</p>}
            </div>
          )}

          {sec === 'messages' && (
            <div className="space-y-4">
              {msgs.length === 0 && <p className="text-mute">No messages yet.</p>}
              {msgs.map((m) => (
                <div key={m.id} className={`glass p-5 ${m.read ? '' : '!border-accent/60'}`}>
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div><b>{m.name}</b> <a href={`mailto:${m.email}`} className="text-accent text-sm">{m.email}</a></div>
                    <div className="flex items-center gap-3 text-xs text-mute"><span className={`chip ${m.notified ? '' : '!text-red-400 !border-red-400/40'}`}>{m.notified ? 'emailed' : 'not emailed'}</span>{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                  <p className="mt-3 text-sm whitespace-pre-wrap leading-6">{m.message}</p>
                  <div className="mt-4 flex gap-3">
                    <button className={ghost} onClick={async () => { await call(`/messages/${m.id}`, 'PATCH', { read: !m.read }); load(); }}>{m.read ? 'Mark unread' : 'Mark read'}</button>
                    <button className={`${ghost} !text-red-400`} onClick={() => del('messages', m.id)}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around py-2 border-t border-accent/15 bg-bg/80 backdrop-blur-xl">
        {nav.map(([id, label, I]) => (
          <button key={id} onClick={() => setSec(id)} className={`relative flex flex-col items-center gap-1 text-[9px] px-1 ${sec === id ? 'text-accent' : 'text-mute'}`}><I size={19} />{label.split(' ')[0]}{id === 'messages' && !!stats?.unread && <span className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-accent" />}</button>
        ))}
      </nav>
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-3 sm:w-[22rem] pointer-events-none">
        {toasts.map((x) => (
          <div key={x.id} className="toast-in pointer-events-auto glass !rounded-2xl overflow-hidden flex items-center gap-3 pl-4 pr-3 py-3.5 shadow-2xl">
            {x.type === 'err' ? <AlertCircle size={20} className="text-red-400 shrink-0" /> : <CheckCircle2 size={20} className="text-accent shrink-0" />}
            <span className="text-sm flex-1">{x.msg}</span>
            <button onClick={() => setToasts((a) => a.filter((y) => y.id !== x.id))} aria-label="Dismiss" className="text-mute hover:text-fg"><X size={15} /></button>
            <span className={`toast-bar absolute bottom-0 left-0 h-0.5 ${x.type === 'err' ? 'bg-red-400' : 'bg-accent'}`} />
          </div>
        ))}
      </div>
    </div>
    </ToastCtx.Provider></TokenCtx.Provider>
  );
}
