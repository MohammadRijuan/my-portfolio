'use client';
/**
 * /contact — the Contact page.
 *
 * All of this page's code lives in this file (layout, text, small helpers).
 * Shared building blocks are imported from @/components, data from @/lib.
 * The URL /contact comes from this folder name; the 3D slide between pages is done by <SiteShell> (see components/SiteShell.tsx).
 */
import { useState } from 'react';
import { Send, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';
import ScrollPage from '@/components/ScrollPage';
import TiltCard from '@/components/TiltCard';
import Icon from '@/components/Icon';
import { useData } from '@/components/DataProvider';
import { API_URL } from '@/lib/data';
import { revealDelayStyle } from '@/lib/ui';

type Step = 'form' | 'done';

export default function Contact() {
  const { settings } = useData();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({ name: '', email: '', message: '', website: '' });
  const [isSending, setIsSending] = useState(false), [errorMessage, setErrorMessage] = useState('');

  const postJson = async (path: string, body: object) => {
    const response = await fetch(`${API_URL}/api${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(responseBody.error || 'Something went wrong. Please try again.');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setErrorMessage(''); setIsSending(true);
    try { await postJson('/contact', formData); setStep('done'); }
    catch (error: any) { setErrorMessage(error.message); }
    setIsSending(false);
  };

  const inputClass = 'w-full bg-white/[.03] border border-accent/25 rounded-xl px-4 py-3 outline-none focus:border-accent focus:shadow-[0_0_20px_rgb(var(--accent)/.2)] transition placeholder:text-mute/60';
  const submitButtonClass = 'btn-shine group flex items-center gap-3 px-7 py-3 rounded-full font-medium text-black bg-gradient-to-r from-accent to-accent2 hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100';
  const visibleSocialLinks = settings.socials.filter((social) => social.url);
  const whatsappDigits = settings.contact_whatsapp.replace(/\D/g, '');
  const contactRowClass = 'group flex items-center gap-2.5 p-3 rounded-xl border border-accent/20 bg-white/[.02] hover:border-accent hover:bg-accent/5 hover:translate-x-1 transition';
  const contactIconClass = 'w-8 h-8 rounded-full bg-accent/15 text-accent grid place-items-center group-hover:scale-110 group-hover:bg-accent group-hover:text-black transition';

  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={revealDelayStyle(0)}>Get in <span className="text-accent text-glow">Touch</span></h2>
      <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <TiltCard revealDelay={1} className="p-6 sm:p-8" maxTilt={4}>
          <p className="leading-7 text-fg/85">{settings.contact_text}</p>
          <div className="mt-6 space-y-3">
            {settings.contact_email && <a href={`mailto:${settings.contact_email}`} className={contactRowClass}><span className={contactIconClass}><Mail size={20} /></span><span className="min-w-0"><span className="block text-xs text-mute">Gmail</span><span className="block break-all">{settings.contact_email}</span></span></a>}
            {whatsappDigits && <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className={contactRowClass}><span className={contactIconClass}><MessageCircle size={20} /></span><span><span className="block text-xs text-mute">WhatsApp</span><span className="block">{settings.contact_whatsapp}</span></span></a>}
          </div>
          {visibleSocialLinks.length > 0 && <div className="mt-6 flex gap-3">{visibleSocialLinks.map((social) => (
            <a key={social.label} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label} className="glass !rounded-full w-11 h-11 grid place-items-center text-accent hover:-translate-y-1.5 hover:scale-110"><Icon name={social.icon} size={18} /></a>
          ))}</div>}
        </TiltCard>

        <TiltCard revealDelay={2} className="p-6 sm:p-8" maxTilt={3}>
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" value={formData.website} onChange={(event) => setFormData({ ...formData, website: event.target.value })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <input required placeholder="Your name" className={inputClass} value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                <input required type="email" placeholder="Your email" className={inputClass} value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              </div>
              <textarea required rows={6} maxLength={3000} placeholder="Message" className={inputClass} value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} />
              <button disabled={isSending} className={submitButtonClass}><Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition" /> {isSending ? 'Sending…' : 'Send message'}</button>
              {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <span className="mx-auto w-16 h-16 rounded-full bg-accent/15 text-accent grid place-items-center shadow-[0_0_40px_rgb(var(--accent)/.4)]"><CheckCircle2 size={34} /></span>
              <h3 className="mt-5 text-2xl font-semibold">Message sent!</h3>
              <p className="mt-2 text-sm text-mute">Thanks {formData.name.split(' ')[0]} — I&apos;ll reply to <span className="text-fg">{formData.email}</span> soon.</p>
              <button onClick={() => { setFormData({ name: '', email: '', message: '', website: '' }); setStep('form'); }} className="mt-6 text-accent text-sm">Send another message</button>
            </div>
          )}
        </TiltCard>
      </div>
    </ScrollPage>
  );
}

