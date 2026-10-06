'use client';
/**
 * /about — the About page.
 *
 * All of this page's code lives in this file (layout, text, small helpers).
 * Shared building blocks are imported from @/components, data from @/lib.
 * The URL /about comes from this folder name; the 3D slide between pages is done by <SiteShell> (see components/SiteShell.tsx).
 */
import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import ScrollPage from '@/components/ScrollPage';
import TiltCard from '@/components/TiltCard';
import Icon from '@/components/Icon';
import Lightbox, { LightboxImage } from '@/components/Lightbox';
import { useData } from '@/components/DataProvider';
import { mediaUrl } from '@/lib/data';
import { revealDelayStyle } from '@/lib/ui';

export default function About() {
  const { settings } = useData();
  const [lightbox, setLightbox] = useState<{ images: LightboxImage[]; index: number } | null>(null);
  const fullName = `${settings.name_main} ${settings.name_accent}`;
  const certificates = settings.certifications.filter((certificate) => certificate.image);
  const certificateImages: LightboxImage[] = certificates.map((certificate) => ({ src: mediaUrl(certificate.image), alt: certificate.title || 'Certificate' }));
  const initials = ((settings.name_main.trim().split(' ').pop() || '')[0] || '') + (settings.name_accent[0] || '');

  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={revealDelayStyle(0)}>About <span className="text-accent text-glow">Me</span></h2>

      <TiltCard revealDelay={1} data-step className="mt-8 p-6 sm:p-10 min-h-[50vh] grid md:grid-cols-[250px_1fr] gap-8 md:gap-12 items-center" maxTilt={3}>
        <div className="mx-auto">
          <button disabled={!settings.profile_image} onClick={() => setLightbox({ images: [{ src: mediaUrl(settings.profile_image), alt: fullName }], index: 0 })} aria-label="View photo"
            className="group relative block w-44 h-44 sm:w-56 sm:h-56 rounded-full disabled:cursor-default">
            <span className="absolute -inset-3 rounded-full border border-dashed border-accent/50 animate-spin-slow" />
            <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent to-accent2 opacity-60 blur-md group-hover:opacity-90 transition" />
            <span className="relative block w-full h-full rounded-full overflow-hidden border-2 border-accent/60 bg-card group-hover:scale-105 transition duration-500">
              {settings.profile_image
                ? <img src={mediaUrl(settings.profile_image)} alt={fullName} className="w-full h-full object-cover" />
                : <span className="w-full h-full grid place-items-center text-5xl font-bold text-accent">{initials}</span>}
              {settings.profile_image && <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition"><ZoomIn /></span>}
            </span>
          </button>
        </div>
        <div>
          <h3 className="text-2xl font-semibold">{fullName}</h3>
          <p className="text-accent mt-1">{settings.role}</p>
          <p className="mt-5 leading-8 text-fg/85 max-w-2xl">{settings.about_text}</p>
        </div>
      </TiltCard>

      <div data-step className="mt-8 grid md:grid-cols-3 gap-6 min-h-[40vh] content-center">
        {settings.services.map((service, index) => (
          <TiltCard key={service.title} revealDelay={index} className="p-7 group" maxTilt={14}>
            <Icon name={service.icon} size={36} className="text-accent group-hover:scale-125 group-hover:-rotate-6 transition duration-500" />
            <h4 className="mt-4 text-lg font-medium">{service.title}</h4><p className="mt-2 text-sm text-mute leading-6">{service.text}</p>
          </TiltCard>
        ))}
      </div>

      <TiltCard revealDelay={1} data-step className="mt-8 p-6 sm:p-10 min-h-[35vh] grid sm:grid-cols-3 gap-6 content-center" maxTilt={3}>
        {settings.facts.map((fact) => (
          <div key={fact.title} className="group flex items-center gap-4"><Icon name={fact.icon} size={38} className="text-accent group-hover:scale-125 transition" /><div className="text-lg">{fact.title}<br /><span className="text-sm text-mute">{fact.sub}</span></div></div>
        ))}
      </TiltCard>

      {certificates.length > 0 && (
        <TiltCard revealDelay={1} data-step className="mt-8 p-6 sm:p-10" maxTilt={2}>
          <h3 className="text-2xl font-semibold">Certifications</h3>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 sm:gap-6">
            {certificates.map((certificate, index) => (
              <button key={index} onClick={() => setLightbox({ images: certificateImages, index: index })} className="group text-left">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-xl border border-accent/25 group-hover:border-accent group-hover:shadow-[0_0_30px_rgb(var(--accent)/.35)] transition">
                  <img src={mediaUrl(certificate.image)} alt={certificate.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition"><ZoomIn /></span>
                </span>
                {certificate.title && <span className="block mt-2 text-sm text-fg/85 group-hover:text-accent transition">{certificate.title}</span>}
              </button>
            ))}
          </div>
        </TiltCard>
      )}

      <Lightbox images={lightbox?.images || []} index={lightbox ? lightbox.index : null} onClose={() => setLightbox(null)} onChangeIndex={(newIndex) => setLightbox((current) => (current ? { ...current, index: newIndex } : current))} />
    </ScrollPage>
  );
}
