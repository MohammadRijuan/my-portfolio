'use client';
import { useState } from 'react';
import { Send, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';
import ScrollPage from '../ScrollPage';
import TiltCard from '../TiltCard';
import Icon from '../Icon';
import { useData } from '../DataProvider';
import { API } from '@/lib/data';
import { dl } from '@/lib/ui';

type Step = 'form' | 'done';

export default function Contact() {
  const { settings: s } = useData();
  const [step, setStep] = useState<Step>('form');
  const [d, setD] = useState({ name: '', email: '', message: '', website: '' });
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');

  const post = async (path: string, body: object) => {
    const r = await fetch(`${API}/api${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await post('/contact', d); setStep('done'); }
    catch (x: any) { setErr(x.message); }
    setBusy(false);
  };

  const input = 'w-full bg-white/[.03] border border-accent/25 rounded-xl px-4 py-3 outline-none focus:border-accent focus:shadow-[0_0_20px_rgb(var(--accent)/.2)] transition placeholder:text-mute/60';
  const cta = 'btn-shine group flex items-center gap-3 px-7 py-3 rounded-full font-medium text-black bg-gradient-to-r from-accent to-accent2 hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100';
  const socials = s.socials.filter((x) => x.url);
  const wa = s.contact_whatsapp.replace(/\D/g, '');
  const row = 'group flex items-center gap-4 p-4 rounded-xl border border-accent/20 bg-white/[.02] hover:border-accent hover:bg-accent/5 hover:translate-x-1 transition';
  const badge = 'w-11 h-11 rounded-full bg-accent/15 text-accent grid place-items-center group-hover:scale-110 group-hover:bg-accent group-hover:text-black transition';

  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={dl(0)}>Get in <span className="text-accent text-glow">Touch</span></h2>
      <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <TiltCard d={1} className="p-6 sm:p-8" max={4}>
          <p className="leading-7 text-fg/85">{s.contact_text}</p>
          <div className="mt-6 space-y-3">
            {s.contact_email && <a href={`mailto:${s.contact_email}`} className={row}><span className={badge}><Mail size={20} /></span><span className="min-w-0"><span className="block text-xs text-mute">Gmail</span><span className="block truncate">{s.contact_email}</span></span></a>}
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={row}><span className={badge}><MessageCircle size={20} /></span><span><span className="block text-xs text-mute">WhatsApp</span><span className="block">{s.contact_whatsapp}</span></span></a>}
          </div>
          {socials.length > 0 && <div className="mt-6 flex gap-3">{socials.map((x) => (
            <a key={x.label} href={x.url} target="_blank" rel="noreferrer" aria-label={x.label} className="glass !rounded-full w-11 h-11 grid place-items-center text-accent hover:-translate-y-1.5 hover:scale-110"><Icon name={x.icon} size={18} /></a>
          ))}</div>}
        </TiltCard>

        <TiltCard d={2} className="p-6 sm:p-8" max={3}>
          {step === 'form' && (
            <form onSubmit={submit} className="space-y-4">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" value={d.website} onChange={(e) => setD({ ...d, website: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder="Your name" className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
                <input required type="email" placeholder="Your email" className={input} value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
              </div>
              <textarea required rows={6} maxLength={3000} placeholder="Message" className={input} value={d.message} onChange={(e) => setD({ ...d, message: e.target.value })} />
              <button disabled={busy} className={cta}><Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition" /> {busy ? 'Sending…' : 'Send message'}</button>
              {err && <p className="text-red-400 text-sm">{err}</p>}
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <span className="mx-auto w-16 h-16 rounded-full bg-accent/15 text-accent grid place-items-center shadow-[0_0_40px_rgb(var(--accent)/.4)]"><CheckCircle2 size={34} /></span>
              <h3 className="mt-5 text-2xl font-semibold">Message sent!</h3>
              <p className="mt-2 text-sm text-mute">Thanks {d.name.split(' ')[0]} — I&apos;ll reply to <span className="text-fg">{d.email}</span> soon.</p>
              <button onClick={() => { setD({ name: '', email: '', message: '', website: '' }); setStep('form'); }} className="mt-6 text-accent text-sm">Send another message</button>
            </div>
          )}
        </TiltCard>
      </div>
    </ScrollPage>
  );
}

