'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type LbItem = { src: string; alt: string };
type P = { images: LbItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void };

/** Responsive fullscreen image viewer: Esc / click outside to close, arrows or swipe to browse. */
export default function Lightbox({ images, index, onClose, onIndex }: P) {
  const x0 = useRef(0), n = images.length;
  const open = index !== null && n > 0;
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (!['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.stopPropagation(); // keep the page pager from reacting
      if (e.key === 'Escape') onClose();
      else onIndex((index! + (e.key === 'ArrowRight' ? 1 : -1) + n) % n);
    };
    addEventListener('keydown', k, true); return () => removeEventListener('keydown', k, true);
  });
  if (!open || typeof document === 'undefined') return null;
  const it = images[index!], stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const step = (d: number) => (e: React.MouseEvent) => { e.stopPropagation(); onIndex((index! + d + n) % n); };
  const arrow = 'absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-black backdrop-blur grid place-items-center transition';
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md grid place-items-center p-3 sm:p-8 text-white" onClick={onClose} onWheel={stop}
      onTouchStart={(e) => { e.stopPropagation(); x0.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { e.stopPropagation(); const dx = x0.current - e.changedTouches[0].clientX; if (n > 1 && Math.abs(dx) > 60) onIndex((index! + (dx > 0 ? 1 : -1) + n) % n); }}>
      <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-black grid place-items-center transition hover:rotate-90"><X size={20} /></button>
      {n > 1 && <button onClick={step(-1)} aria-label="Previous" className={`${arrow} left-2 sm:left-6`}><ChevronLeft /></button>}
      {n > 1 && <button onClick={step(1)} aria-label="Next" className={`${arrow} right-2 sm:right-6`}><ChevronRight /></button>}
      <figure className="flex flex-col items-center max-w-full" onClick={stop}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={index} src={it.src} alt={it.alt} className="lb-in max-w-[94vw] max-h-[78vh] sm:max-h-[84vh] object-contain rounded-xl shadow-[0_0_80px_rgb(var(--accent)/.25)]" />
        <figcaption className="mt-4 text-sm text-white/80 text-center">{it.alt}{n > 1 && <span className="ml-3 text-white/50">{index! + 1} / {n}</span>}</figcaption>
      </figure>
    </div>, document.body);
}
