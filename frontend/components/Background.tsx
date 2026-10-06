'use client';
import { useEffect, useRef } from 'react';

const shapes = [
  { type: 'hex', left: '9%', top: '60%', size: 54, parallax: 26 }, { type: 'ring', left: '76%', top: '72%', size: 84, parallax: -40 }, { type: 'tri', left: '90%', top: '36%', size: 40, parallax: 34 },
  { type: 'plus', left: '5%', top: '28%', size: 30, parallax: -22 }, { type: 'ring', left: '50%', top: '7%', size: 30, parallax: 18 }, { type: 'hex', left: '58%', top: '90%', size: 34, parallax: -30 },
  { type: 'tri', left: '30%', top: '12%', size: 26, parallax: 20 },
];
const renderShape = (shapeType: string) => shapeType === 'hex' ? <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" /> : shapeType === 'ring' ? <circle cx="20" cy="20" r="17" /> : shapeType === 'tri' ? <polygon points="20,4 37,34 3,34" /> : <path d="M20 6v28M6 20h28" />;
const dots = [[8, 12], [66, 11], [93, 19], [4, 72], [81, 53], [47, 31], [24, 88], [97, 80]];

export default function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let animationFrameId = 0, targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const handlePointerMove = (event: PointerEvent) => { targetX = event.clientX / innerWidth - 0.5; targetY = event.clientY / innerHeight - 0.5; };
    const animate = () => {
      currentX += (targetX - currentX) * 0.05; currentY += (targetY - currentY) * 0.05;
      containerRef.current?.style.setProperty('--px', String(currentX)); containerRef.current?.style.setProperty('--py', String(currentY));
      animationFrameId = requestAnimationFrame(animate);
    };
    addEventListener('pointermove', handlePointerMove); animate();
    return () => { removeEventListener('pointermove', handlePointerMove); cancelAnimationFrame(animationFrameId); };
  }, []);
  const parallax = (strength: number) => ({ transform: `translate(calc(var(--px,0)*${strength}px),calc(var(--py,0)*${strength}px))` });
  const orb = (diameter: number, color: string, position: object) => (
    <div className="absolute" style={{ ...parallax(Math.round(diameter / 8)), ...position }}>
      <div className="rounded-full animate-drift" style={{ width: diameter, height: diameter, background: `radial-gradient(circle at 30% 28%, ${color}, rgb(var(--accent2)/.18) 45%, transparent 70%)`, filter: 'blur(2px)', opacity: 'var(--blob)' as any }} />
    </div>
  );
  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute rounded-full blur-3xl animate-drift" style={{ width: 640, height: 640, right: '-10%', top: '-12%', opacity: 'var(--blob)' as any, background: 'radial-gradient(circle,rgb(var(--accent)/.5),transparent 65%)' }} />
      <div className="absolute rounded-full blur-3xl animate-drift" style={{ width: 520, height: 520, left: '-12%', bottom: '-14%', animationDelay: '-6s', opacity: 'var(--blob)' as any, background: 'radial-gradient(circle,rgb(var(--accent2)/.45),transparent 65%)' }} />
      {orb(190, 'rgb(var(--accent)/.55)', { left: '-3%', top: '14%' })}
      {orb(120, 'rgb(var(--accent)/.5)', { left: '47%', top: '22%' })}
      {orb(260, 'rgb(var(--orb)/.4)', { right: '6%', bottom: '4%' })}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600" style={parallax(-14)}>
        {['M-50 460 C 250 380, 400 620, 760 430 S 1000 250, 1100 180', 'M-50 120 C 200 260, 360 -20, 640 140 S 940 360, 1100 300', 'M200 650 C 360 480, 620 520, 820 360 S 1000 120, 1100 60'].map((pathData, index) => (
          <g key={index} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
            <path d={pathData} stroke="rgb(var(--accent))" strokeOpacity=".14" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={pathData} stroke="rgb(var(--accent))" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="6 70" className="animate-dash" style={{ animationDuration: `${18 + index * 7}s` }} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {shapes.map((shapeConfig, index) => (
        <div key={index} className="absolute text-accent" style={{ left: shapeConfig.left, top: shapeConfig.top, ...parallax(shapeConfig.parallax) }}>
          <div className="animate-float" style={{ animationDelay: `${index * -1.3}s`, animationDuration: `${6 + index}s` }}>
            <svg width={shapeConfig.size} height={shapeConfig.size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity=".45" className="animate-spin-slow" style={{ animationDuration: `${30 + index * 8}s`, animationDirection: index % 2 ? 'reverse' : 'normal' }}>{renderShape(shapeConfig.type)}</svg>
          </div>
        </div>
      ))}
      {dots.map(([leftPercent, topPercent], index) => <span key={index} className="absolute w-2 h-2 rounded-full bg-accent animate-pulse-dot shadow-[0_0_14px_rgb(var(--accent))]" style={{ left: `${leftPercent}%`, top: `${topPercent}%`, animationDelay: `${index * -0.7}s`, ...parallax(index * 3 - 10) }} />)}
    </div>
  );
}
