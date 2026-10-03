'use client';
import { useEffect, useRef } from 'react';

type P = { name: string; role: string; passion: string; location: string; footer: string };
const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/** Product-style 3D card: layered depth, glare and spring-smoothed tilt that follows the pointer. Floats when idle. */
export default function DevCard(p: P) {
  const area = useRef<HTMLDivElement>(null), card = useRef<HTMLDivElement>(null), bob = useRef<HTMLDivElement>(null);
  const s = useRef({ tx: 0, ty: 0, x: 0, y: 0, sc: 1, tsc: 1, hover: false, t: 0 });
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const v = s.current; v.t += 0.016;
      const tx = v.hover ? v.tx : Math.sin(v.t * 0.7) * 0.3, ty = v.hover ? v.ty : Math.cos(v.t * 0.5) * 0.2;
      v.x += (tx - v.x) * 0.09; v.y += (ty - v.y) * 0.09; v.sc += (v.tsc - v.sc) * 0.1;
      const el = card.current;
      if (el) {
        el.style.transform = `scale(${v.sc}) rotateY(${-14 + v.x * 32}deg) rotateX(${8 - v.y * 32}deg) rotateZ(-3deg)`;
        el.style.setProperty('--gx', `${50 + v.x * 80}%`); el.style.setProperty('--gy', `${50 + v.y * 80}%`);
      }
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, []);
  const move = (e: React.PointerEvent) => {
    const r = area.current!.getBoundingClientRect(), v = s.current;
    v.hover = true; v.tsc = 1.05;
    v.tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2)); v.ty = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    bob.current && (bob.current.style.animationPlayState = 'paused');
  };
  const leave = () => { s.current.hover = false; s.current.tsc = 1; bob.current && (bob.current.style.animationPlayState = 'running'); };
  const z = (n: number) => ({ transform: `translateZ(${n}px)` });
  const str = (v: string) => <span className="text-accent">&quot;{v}&quot;</span>;
  const rows: [string, React.ReactNode][] = [
    ['name', str(p.name)], ['role', str(p.role)], ['passion', str(p.passion)], ['location', str(p.location)],
  ];
  return (
    <div ref={area} onPointerMove={move} onPointerLeave={leave} onPointerCancel={leave} className="p-4 sm:p-10 touch-pan-y select-none">
      <div ref={bob} className="animate-float" style={{ perspective: 1300 }}>
        <div ref={card} className="relative max-w-[470px] mx-auto lg:ml-auto" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {[34, 17].map((d) => <div key={d} className="absolute inset-0 rounded-[1.1rem] border border-accent/30 bg-accent/5" style={z(-d)} />)}
          <div className="relative rounded-[1.1rem] border border-accent/40 p-5 sm:p-7 font-mono text-[11px] sm:text-[13px]"
            style={{ transformStyle: 'preserve-3d', background: 'linear-gradient(135deg,rgb(var(--card)/.92),rgb(var(--card)/.7))', boxShadow: '0 0 90px rgb(var(--accent)/.3),0 30px 60px -20px rgb(0 0 0/.65),inset 0 1px 0 rgb(255 255 255/.12)' }}>
            <div className="flex gap-2 mb-5" style={z(46)}>{[1, 1, 0.45].map((o, k) => <span key={k} className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" style={{ opacity: o }} />)}</div>
            <div className="leading-7 sm:leading-8" style={z(30)}>
              <div className="flex gap-4"><span className="text-mute/50 w-3">1</span><span><span className="text-cyan-300">const</span> developer = {'{'}</span></div>
              {rows.map(([k, v], i) => (
                <div key={k} className="flex gap-4"><span className="text-mute/50 w-3">{i + 2}</span><span className="pl-5">{k}: {v},</span></div>
              ))}
              <div className="flex gap-4"><span className="text-mute/50 w-3">6</span><span>{'};'}</span></div>
            </div>
            <div className="mt-6 text-mute" style={z(20)}>{'// '}{p.footer} <span className="inline-block w-2 h-4 align-middle bg-accent animate-blink" /></div>
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none mix-blend-overlay" style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgb(255 255 255/.4),transparent 55%)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
