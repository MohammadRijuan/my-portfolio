'use client';
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Sun, Moon, Code2, Menu, X } from 'lucide-react';
import { useData } from './DataProvider';

export type PageDef = { id: string; label: string; node: ReactNode };
const NavCtx = createContext<(id: string) => void>(() => {});
export const useNav = () => useContext(NavCtx);

export default function Pager({ pages: all }: { pages: PageDef[] }) {
  const { settings } = useData();
  const hidden = settings.hidden_pages.split(',').map((x) => x.trim());
  const pages = all.filter((p) => !hidden.includes(p.id));
  const [i, setI] = useState(0), [light, setLight] = useState(false), [menu, setMenu] = useState(false), [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(0), lock = useRef(0), touch = useRef({ x: 0, y: 0, atStart: false, atEnd: false });

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'));
    const n = pages.findIndex((p) => p.id === location.hash.slice(1));
    if (n > 0) setI(n);
  }, []);
  useEffect(() => {
    const sc = ref.current?.querySelector<HTMLElement>(`[data-page="${i}"] [data-scroller]`);
    setScrolled((sc?.scrollTop || 0) > 8);
  }, [i]);
  const toggle = () => {
    const l = !light; setLight(l); document.documentElement.classList.toggle('light', l);
    try { localStorage.setItem('theme', l ? 'light' : 'dark'); } catch {}
  };
  const go = (n: number) => {
    const t = Math.max(0, Math.min(pages.length - 1, n)); setMenu(false); if (t === i) return;
    lock.current = Date.now() + 1000; setI(t); history.replaceState(null, '', '#' + pages[t].id);
  };
  const goId = (id: string) => go(pages.findIndex((p) => p.id === id));

  const edge = () => {
    const sc = ref.current?.querySelector<HTMLElement>(`[data-page="${i}"] [data-scroller]`);
    return { atStart: !sc || sc.scrollTop <= 1, atEnd: !sc || sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2 };
  };
  // Scroll inside the page first; only when its end is reached does the next scroll switch pages.
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 6) return;
    const now = Date.now(), idle = now - last.current > 250; last.current = now;
    if (now < lock.current || !idle) return;
    const { atStart, atEnd } = edge();
    if (e.deltaY > 0 && atEnd) go(i + 1); else if (e.deltaY < 0 && atStart) go(i - 1);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current, dx = t.x - e.changedTouches[0].clientX, dy = t.y - e.changedTouches[0].clientY;
    if (Date.now() < lock.current) return;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.3) go(i + (dx > 0 ? 1 : -1));
    else if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx)) { if (dy > 0 && t.atEnd) go(i + 1); else if (dy < 0 && t.atStart) go(i - 1); }
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select')) return;
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  });

  return (
    <NavCtx.Provider value={goId}>
      <div ref={ref} onWheel={onWheel}
        onScrollCapture={(e) => { const el = e.target as HTMLElement; if (el.hasAttribute?.('data-scroller')) setScrolled(el.scrollTop > 8); }}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ...edge() })} onTouchEnd={onTouchEnd}
        className="fixed inset-0 z-10 overflow-hidden" style={{ perspective: '1800px' }}>
        <header className={`fixed top-0 inset-x-0 z-50 h-20 backdrop-blur-md border-b transition-all duration-500 ${scrolled ? 'bg-bg/70 backdrop-blur-xl border-accent/15 shadow-[0_10px_40px_-20px_rgb(0_0_0/.8)]' : 'bg-bg/10 border-transparent'}`}>
          <div className="relative mx-auto h-full max-w-[1440px] flex items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <button onClick={() => go(0)} className="group flex items-center gap-3 font-semibold text-lg">
            <Code2 className="text-accent group-hover:rotate-12 group-hover:scale-110 transition" size={30} />{settings.logo_text}
          </button>
          <nav className="hidden md:flex gap-6 lg:gap-9 text-sm absolute left-1/2 -translate-x-1/2">
            {pages.map((p, k) => (
              <button key={p.id} onClick={() => go(k)} className={`relative py-2 transition-all hover:-translate-y-0.5 ${k === i ? 'text-accent' : 'text-fg/80 hover:text-accent'}`}>
                {p.label}
                <span className={`absolute left-0 -bottom-0.5 h-0.5 rounded bg-accent shadow-[0_0_10px_rgb(var(--accent))] transition-all duration-500 ${k === i ? 'w-full' : 'w-0'}`} />
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggle} aria-label="Toggle theme" className="glass btn-shine !rounded-full px-3 sm:px-4 py-2 text-xs flex items-center gap-2 hover:scale-105">
              {light ? <Moon size={14} className="text-accent" /> : <Sun size={14} className="text-accent" />}<span className="hidden sm:inline">Dark / Light</span>
            </button>
            <button onClick={() => setMenu(!menu)} aria-label="Menu" className="md:hidden glass !rounded-full p-2.5">{menu ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
          </div>
        </header>
        <div className={`md:hidden fixed inset-0 z-40 bg-bg/90 backdrop-blur-xl flex flex-col items-center justify-center gap-7 transition-all duration-500 ${menu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {pages.map((p, k) => (
            <button key={p.id} onClick={() => go(k)} className={`text-3xl font-semibold transition-all duration-500 ${k === i ? 'text-accent' : 'text-fg'}`} style={{ transitionDelay: menu ? `${k * 60}ms` : '0ms', transform: menu ? 'none' : 'translateY(20px)' }}>{p.label}</button>
          ))}
        </div>
        {pages.map((p, k) => {
          const o = k - i;
          return (
            <div key={p.id} data-page={k} data-active={o === 0} aria-hidden={o !== 0} className="absolute inset-0"
              style={{
                transform: `translate3d(${o * 100}%,0,0) rotateY(${o * -26}deg) scale(${o === 0 ? 1 : 0.8})`,
                transformOrigin: o > 0 ? 'left center' : 'right center',
                opacity: o === 0 ? 1 : 0, pointerEvents: o === 0 ? 'auto' : 'none',
                transition: 'transform 1s cubic-bezier(.77,0,.18,1), opacity .7s ease',
              }}>{p.node}</div>
          );
        })}
      </div>
    </NavCtx.Provider>
  );
}
