'use client';
import { useEffect, useRef } from 'react';

const shapes = [
  { t: 'hex', x: '9%', y: '60%', s: 54, k: 26 }, { t: 'ring', x: '76%', y: '72%', s: 84, k: -40 }, { t: 'tri', x: '90%', y: '36%', s: 40, k: 34 },
  { t: 'plus', x: '5%', y: '28%', s: 30, k: -22 }, { t: 'ring', x: '50%', y: '7%', s: 30, k: 18 }, { t: 'hex', x: '58%', y: '90%', s: 34, k: -30 },
  { t: 'tri', x: '30%', y: '12%', s: 26, k: 20 },
];
const shape = (t: string) => t === 'hex' ? <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" /> : t === 'ring' ? <circle cx="20" cy="20" r="17" /> : t === 'tri' ? <polygon points="20,4 37,34 3,34" /> : <path d="M20 6v28M6 20h28" />;
const dots = [[8, 12], [66, 11], [93, 19], [4, 72], [81, 53], [47, 31], [24, 88], [97, 80]];

export default function Background() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const move = (e: PointerEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
    const loop = () => {
      x += (tx - x) * 0.05; y += (ty - y) * 0.05;
      ref.current?.style.setProperty('--px', String(x)); ref.current?.style.setProperty('--py', String(y));
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', move); loop();
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
  const par = (k: number) => ({ transform: `translate(calc(var(--px,0)*${k}px),calc(var(--py,0)*${k}px))` });
  const orb = (w: number, c: string, extra: object) => (
    <div className="absolute" style={{ ...par(Math.round(w / 8)), ...extra }}>
      <div className="rounded-full animate-drift" style={{ width: w, height: w, background: `radial-gradient(circle at 30% 28%, ${c}, rgb(var(--accent2)/.18) 45%, transparent 70%)`, filter: 'blur(2px)', opacity: 'var(--blob)' as any }} />
    </div>
  );
  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute rounded-full blur-3xl animate-drift" style={{ width: 640, height: 640, right: '-10%', top: '-12%', opacity: 'var(--blob)' as any, background: 'radial-gradient(circle,rgb(var(--accent)/.5),transparent 65%)' }} />
      <div className="absolute rounded-full blur-3xl animate-drift" style={{ width: 520, height: 520, left: '-12%', bottom: '-14%', animationDelay: '-6s', opacity: 'var(--blob)' as any, background: 'radial-gradient(circle,rgb(var(--accent2)/.45),transparent 65%)' }} />
      {orb(190, 'rgb(var(--accent)/.55)', { left: '-3%', top: '14%' })}
      {orb(120, 'rgb(var(--accent)/.5)', { left: '47%', top: '22%' })}
      {orb(260, 'rgb(var(--orb)/.4)', { right: '6%', bottom: '4%' })}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600" style={par(-14)}>
        {['M-50 460 C 250 380, 400 620, 760 430 S 1000 250, 1100 180', 'M-50 120 C 200 260, 360 -20, 640 140 S 940 360, 1100 300', 'M200 650 C 360 480, 620 520, 820 360 S 1000 120, 1100 60'].map((d, i) => (
          <g key={i} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
            <path d={d} stroke="rgb(var(--accent))" strokeOpacity=".14" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={d} stroke="rgb(var(--accent))" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="6 70" className="animate-dash" style={{ animationDuration: `${18 + i * 7}s` }} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {shapes.map((s, i) => (
        <div key={i} className="absolute text-accent" style={{ left: s.x, top: s.y, ...par(s.k) }}>
          <div className="animate-float" style={{ animationDelay: `${i * -1.3}s`, animationDuration: `${6 + i}s` }}>
            <svg width={s.s} height={s.s} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity=".45" className="animate-spin-slow" style={{ animationDuration: `${30 + i * 8}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>{shape(s.t)}</svg>
          </div>
        </div>
      ))}
      {dots.map(([x, y], i) => <span key={i} className="absolute w-2 h-2 rounded-full bg-accent animate-pulse-dot shadow-[0_0_14px_rgb(var(--accent))]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * -0.7}s`, ...par(i * 3 - 10) }} />)}
    </div>
  );
}
