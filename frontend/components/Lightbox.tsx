'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type LightboxImage = { src: string; alt: string };
type LightboxProps = { images: LightboxImage[]; index: number | null; onClose: () => void; onChangeIndex: (newIndex: number) => void };

/** Responsive fullscreen image viewer: Esc / click outside to close, arrows or swipe to browse. */
export default function Lightbox({ images, index, onClose, onChangeIndex }: LightboxProps) {
  const touchStartX = useRef(0), imageCount = images.length;
  const open = index !== null && imageCount > 0;
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.stopPropagation(); // keep the page pager from reacting
      if (event.key === 'Escape') onClose();
      else onChangeIndex((index! + (event.key === 'ArrowRight' ? 1 : -1) + imageCount) % imageCount);
    };
    addEventListener('keydown', handleKeyDown, true); return () => removeEventListener('keydown', handleKeyDown, true);
  });
  if (!open || typeof document === 'undefined') return null;
  const currentImage = images[index!], stopClick = (event: React.SyntheticEvent) => event.stopPropagation();
  const showNeighbour = (direction: number) => (event: React.MouseEvent) => { event.stopPropagation(); onChangeIndex((index! + direction + imageCount) % imageCount); };
  const arrowButtonClass = 'absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-black backdrop-blur grid place-items-center transition';
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md grid place-items-center p-3 sm:p-8 text-white" onClick={onClose} onWheel={stopClick}
      onTouchStart={(event) => { event.stopPropagation(); touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => { event.stopPropagation(); const swipeDistance = touchStartX.current - event.changedTouches[0].clientX; if (imageCount > 1 && Math.abs(swipeDistance) > 60) onChangeIndex((index! + (swipeDistance > 0 ? 1 : -1) + imageCount) % imageCount); }}>
      <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-black grid place-items-center transition hover:rotate-90"><X size={20} /></button>
      {imageCount > 1 && <button onClick={showNeighbour(-1)} aria-label="Previous" className={`${arrowButtonClass} left-2 sm:left-6`}><ChevronLeft /></button>}
      {imageCount > 1 && <button onClick={showNeighbour(1)} aria-label="Next" className={`${arrowButtonClass} right-2 sm:right-6`}><ChevronRight /></button>}
      <figure className="flex flex-col items-center max-w-full" onClick={stopClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={index} src={currentImage.src} alt={currentImage.alt} className="lb-in max-w-[94vw] max-h-[78vh] sm:max-h-[84vh] object-contain rounded-xl shadow-[0_0_80px_rgb(var(--accent)/.25)]" />
        <figcaption className="mt-4 text-sm text-white/80 text-center">{currentImage.alt}{imageCount > 1 && <span className="ml-3 text-white/50">{index! + 1} / {imageCount}</span>}</figcaption>
      </figure>
    </div>, document.body);
}
