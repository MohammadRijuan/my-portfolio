'use client';
import { ChevronDown } from 'lucide-react';
import { useNav } from './Pager';

/** Animated "Scroll Down" indicator: vertical on desktop (like the mockup), compact on mobile/tablet. */
export default function ScrollHint() {
  const go = useNav();
  return (
    <>
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
        <div className="relative mx-auto h-full max-w-[1440px]">
          <button onClick={() => go('about')} aria-label="Scroll down" className="pointer-events-auto group absolute right-4 top-[43%] flex flex-col items-center gap-4 text-[11px] tracking-[.25em] text-mute hover:text-accent transition-colors">
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Scroll Down</span>
            <span className="relative w-px h-14 bg-accent/20 overflow-hidden"><span className="absolute inset-0 bg-accent" style={{ animation: 'lineflow 2.2s ease-in-out infinite' }} /></span>
            <span className="w-5 h-8 rounded-full border border-mute/70 group-hover:border-accent group-hover:shadow-[0_0_14px_rgb(var(--accent)/.5)] transition flex justify-center pt-1.5">
              <span className="w-0.5 h-1.5 rounded bg-accent" style={{ animation: 'wheel 1.6s ease-in-out infinite' }} />
            </span>
          </button>
        </div>
      </div>
      <button onClick={() => go('about')} aria-label="Scroll down" className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-[10px] tracking-[.3em] text-mute">
        SCROLL DOWN<ChevronDown size={18} className="text-accent" style={{ animation: 'bounce-y 1.4s ease-in-out infinite' }} />
      </button>
    </>
  );
}
