'use client';
import { useEffect, useRef, useState, ReactNode } from 'react';

/** Scrollable page inside a 1440px container. [data-step] elements drive the progress bullets on the right.
 *  Desktop only (lg and up); hidden on tablet and mobile. */
export default function ScrollPage({ children, rail = true }: { children: ReactNode; rail?: boolean }) {
  const sc = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState({ n: 0, filled: 0 });
  const steps = () => Array.from(sc.current?.querySelectorAll<HTMLElement>('[data-step]') || []);
  const calc = () => {
    const s = sc.current; if (!s) return;
    const els = steps(), top = s.getBoundingClientRect().top, limit = s.clientHeight * 0.6;
    const filled = els.filter((e) => e.getBoundingClientRect().top - top <= limit).length;
    setSt((o) => (o.n === els.length && o.filled === filled ? o : { n: els.length, filled }));
  };
  useEffect(() => {
    calc();
    const ro = new ResizeObserver(calc); inner.current && ro.observe(inner.current);
    const w = sc.current?.parentElement; w?.addEventListener('transitionend', calc);
    return () => { ro.disconnect(); w?.removeEventListener('transitionend', calc); };
  }, []);
  const jump = (k: number) => {
    const s = sc.current!, e = steps()[k];
    s.scrollTo({ top: e.getBoundingClientRect().top - s.getBoundingClientRect().top + s.scrollTop - 100, behavior: 'smooth' });
  };
  return (
    <>
      <div ref={sc} data-scroller onScroll={calc} className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar pt-24 pb-16 sm:pb-20">
        <div ref={inner} className={`mx-auto w-full max-w-[1440px] pl-5 sm:pl-8 lg:pl-12 xl:pl-16 pr-5 sm:pr-8 lg:pr-12 xl:pr-16`}>{children}</div>
      </div>
      {rail && st.n > 0 && (
        <div className="hidden lg:block absolute inset-0 pointer-events-none z-20">
          <div className="relative mx-auto h-full max-w-[1440px]">
            <div className="pointer-events-auto absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 flex flex-col items-center">
              {Array.from({ length: st.n }).map((_, k) => (
                <div key={k} className="flex flex-col items-center">
                  <button aria-label={`Section ${k + 1}`} onClick={() => jump(k)}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-accent transition-all duration-500 hover:scale-125 ${k < st.filled ? 'bg-accent shadow-[0_0_14px_rgb(var(--accent))] scale-110' : 'bg-bg/60'}`} />
                  {k < st.n - 1 && (
                    <div className="w-0.5 h-7 sm:h-8 bg-accent/20 overflow-hidden">
                      <div className="w-full bg-accent transition-all duration-700" style={{ height: k + 1 < st.filled ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
