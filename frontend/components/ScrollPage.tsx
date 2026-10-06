'use client';
import { useEffect, useRef, useState, ReactNode } from 'react';

/** Scrollable page inside a 1440px container. [data-step] elements drive the progress bullets on the right.
 *  Desktop only (lg and up); hidden on tablet and mobile. */
export default function ScrollPage({ children, rail = true }: { children: ReactNode; rail?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null), contentRef = useRef<HTMLDivElement>(null);
  const [stepProgress, setStepProgress] = useState({ total: 0, filled: 0 });
  const getStepElements = () => Array.from(scrollerRef.current?.querySelectorAll<HTMLElement>('[data-step]') || []);
  const updateStepProgress = () => {
    const scroller = scrollerRef.current; if (!scroller) return;
    const stepElements = getStepElements(), scrollerTop = scroller.getBoundingClientRect().top, visibleLimit = scroller.clientHeight * 0.6;
    const filled = stepElements.filter((stepElement) => stepElement.getBoundingClientRect().top - scrollerTop <= visibleLimit).length;
    setStepProgress((previous) => (previous.total === stepElements.length && previous.filled === filled ? previous : { total: stepElements.length, filled }));
  };
  useEffect(() => {
    updateStepProgress();
    const resizeObserver = new ResizeObserver(updateStepProgress); contentRef.current && resizeObserver.observe(contentRef.current);
    const pageWrapper = scrollerRef.current?.parentElement; pageWrapper?.addEventListener('transitionend', updateStepProgress);
    return () => { resizeObserver.disconnect(); pageWrapper?.removeEventListener('transitionend', updateStepProgress); };
  }, []);
  const scrollToStep = (stepIndex: number) => {
    const scroller = scrollerRef.current!, stepElement = getStepElements()[stepIndex];
    scroller.scrollTo({ top: stepElement.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 100, behavior: 'smooth' });
  };
  return (
    <>
      <div ref={scrollerRef} data-scroller onScroll={updateStepProgress} className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar pt-24 pb-16 sm:pb-20">
        <div ref={contentRef} className={`mx-auto w-full max-w-[1440px] pl-5 sm:pl-8 lg:pl-12 xl:pl-16 pr-5 sm:pr-8 lg:pr-12 xl:pr-16`}>{children}</div>
      </div>
      {rail && stepProgress.total > 0 && (
        <div className="hidden lg:block absolute inset-0 pointer-events-none z-20">
          <div className="relative mx-auto h-full max-w-[1440px]">
            <div className="pointer-events-auto absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 flex flex-col items-center">
              {Array.from({ length: stepProgress.total }).map((_, stepIndex) => (
                <div key={stepIndex} className="flex flex-col items-center">
                  <button aria-label={`Section ${stepIndex + 1}`} onClick={() => scrollToStep(stepIndex)}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-accent transition-all duration-500 hover:scale-125 ${stepIndex < stepProgress.filled ? 'bg-accent shadow-[0_0_14px_rgb(var(--accent))] scale-110' : 'bg-bg/60'}`} />
                  {stepIndex < stepProgress.total - 1 && (
                    <div className="w-0.5 h-7 sm:h-8 bg-accent/20 overflow-hidden">
                      <div className="w-full bg-accent transition-all duration-700" style={{ height: stepIndex + 1 < stepProgress.filled ? '100%' : '0%' }} />
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
