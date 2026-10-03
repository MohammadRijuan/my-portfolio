'use client';
import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import ScrollPage from '../ScrollPage';
import TiltCard from '../TiltCard';
import Icon from '../Icon';
import Lightbox, { LbItem } from '../Lightbox';
import { useData } from '../DataProvider';
import { img } from '@/lib/data';
import { dl } from '@/lib/ui';

export default function About() {
  const { settings: s } = useData();
  const [lb, setLb] = useState<{ list: LbItem[]; i: number } | null>(null);
  const fullName = `${s.name_main} ${s.name_accent}`;
  const certs = s.certifications.filter((c) => c.image);
  const certItems: LbItem[] = certs.map((c) => ({ src: img(c.image), alt: c.title || 'Certificate' }));
  const initials = ((s.name_main.trim().split(' ').pop() || '')[0] || '') + (s.name_accent[0] || '');

  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={dl(0)}>About <span className="text-accent text-glow">Me</span></h2>

      <TiltCard d={1} data-step className="mt-8 p-6 sm:p-10 min-h-[50vh] grid md:grid-cols-[250px_1fr] gap-8 md:gap-12 items-center" max={3}>
        <div className="mx-auto">
          <button disabled={!s.profile_image} onClick={() => setLb({ list: [{ src: img(s.profile_image), alt: fullName }], i: 0 })} aria-label="View photo"
            className="group relative block w-44 h-44 sm:w-56 sm:h-56 rounded-full disabled:cursor-default">
            <span className="absolute -inset-3 rounded-full border border-dashed border-accent/50 animate-spin-slow" />
            <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent to-accent2 opacity-60 blur-md group-hover:opacity-90 transition" />
            <span className="relative block w-full h-full rounded-full overflow-hidden border-2 border-accent/60 bg-card group-hover:scale-105 transition duration-500">
              {s.profile_image
                ? <img src={img(s.profile_image)} alt={fullName} className="w-full h-full object-cover" />
                : <span className="w-full h-full grid place-items-center text-5xl font-bold text-accent">{initials}</span>}
              {s.profile_image && <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition"><ZoomIn /></span>}
            </span>
          </button>
        </div>
        <div>
          <h3 className="text-2xl font-semibold">{fullName}</h3>
          <p className="text-accent mt-1">{s.role}</p>
          <p className="mt-5 leading-8 text-fg/85 max-w-2xl">{s.about_text}</p>
        </div>
      </TiltCard>

      <div data-step className="mt-8 grid md:grid-cols-3 gap-6 min-h-[40vh] content-center">
        {s.services.map((v, k) => (
          <TiltCard key={v.title} d={k} className="p-7 group" max={14}>
            <Icon name={v.icon} size={36} className="text-accent group-hover:scale-125 group-hover:-rotate-6 transition duration-500" />
            <h4 className="mt-4 text-lg font-medium">{v.title}</h4><p className="mt-2 text-sm text-mute leading-6">{v.text}</p>
          </TiltCard>
        ))}
      </div>

      <TiltCard d={1} data-step className="mt-8 p-6 sm:p-10 min-h-[35vh] grid sm:grid-cols-3 gap-6 content-center" max={3}>
        {s.facts.map((f) => (
          <div key={f.title} className="group flex items-center gap-4"><Icon name={f.icon} size={38} className="text-accent group-hover:scale-125 transition" /><div className="text-lg">{f.title}<br /><span className="text-sm text-mute">{f.sub}</span></div></div>
        ))}
      </TiltCard>

      {certs.length > 0 && (
        <TiltCard d={1} data-step className="mt-8 p-6 sm:p-10" max={2}>
          <h3 className="text-2xl font-semibold">Certifications</h3>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {certs.map((c, k) => (
              <button key={k} onClick={() => setLb({ list: certItems, i: k })} className="group text-left">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-xl border border-accent/25 group-hover:border-accent group-hover:shadow-[0_0_30px_rgb(var(--accent)/.35)] transition">
                  <img src={img(c.image)} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition"><ZoomIn /></span>
                </span>
                {c.title && <span className="block mt-2 text-sm text-fg/85 group-hover:text-accent transition">{c.title}</span>}
              </button>
            ))}
          </div>
        </TiltCard>
      )}

      <Lightbox images={lb?.list || []} index={lb ? lb.i : null} onClose={() => setLb(null)} onIndex={(i) => setLb((o) => (o ? { ...o, i } : o))} />
    </ScrollPage>
  );
}
