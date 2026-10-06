'use client';
import { useEffect, useRef } from 'react';

type DevCardProps = { name: string; role: string; passion: string; location: string; footer: string };
const clamp = (value: number) => Math.max(-1, Math.min(1, value));

/** Product-style 3D card: layered depth, glare and spring-smoothed tilt that follows the pointer. Floats when idle. */
export default function DevCard(props: DevCardProps) {
  const areaRef = useRef<HTMLDivElement>(null), cardRef = useRef<HTMLDivElement>(null), floatRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0, scale: 1, targetScale: 1, isHovering: false, time: 0 });
  useEffect(() => {
    let animationFrameId = 0;
    const animate = () => {
      const motionState = motion.current; motionState.time += 0.016;
      const desiredX = motionState.isHovering ? motionState.targetX : Math.sin(motionState.time * 0.7) * 0.3, desiredY = motionState.isHovering ? motionState.targetY : Math.cos(motionState.time * 0.5) * 0.2;
      motionState.currentX += (desiredX - motionState.currentX) * 0.09; motionState.currentY += (desiredY - motionState.currentY) * 0.09; motionState.scale += (motionState.targetScale - motionState.scale) * 0.1;
      const cardElement = cardRef.current;
      if (cardElement) {
        cardElement.style.transform = `scale(${motionState.scale}) rotateY(${-14 + motionState.currentX * 32}deg) rotateX(${8 - motionState.currentY * 32}deg) rotateZ(-3deg)`;
        cardElement.style.setProperty('--gx', `${50 + motionState.currentX * 80}%`); cardElement.style.setProperty('--gy', `${50 + motionState.currentY * 80}%`);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate(); return () => cancelAnimationFrame(animationFrameId);
  }, []);
  const handlePointerMove = (event: React.PointerEvent) => {
    const areaRect = areaRef.current!.getBoundingClientRect(), motionState = motion.current;
    motionState.isHovering = true; motionState.targetScale = 1.05;
    motionState.targetX = clamp((event.clientX - (areaRect.left + areaRect.width / 2)) / (areaRect.width / 2)); motionState.targetY = clamp((event.clientY - (areaRect.top + areaRect.height / 2)) / (areaRect.height / 2));
    floatRef.current && (floatRef.current.style.animationPlayState = 'paused');
  };
  const handlePointerLeave = () => { motion.current.isHovering = false; motion.current.targetScale = 1; floatRef.current && (floatRef.current.style.animationPlayState = 'running'); };
  const depthStyle = (depth: number) => ({ transform: `translateZ(${depth}px)` });
  const quoted = (text: string) => <span className="text-accent">&quot;{text}&quot;</span>;
  const codeRows: [string, React.ReactNode][] = [
    ['name', quoted(props.name)], ['role', quoted(props.role)], ['passion', quoted(props.passion)], ['location', quoted(props.location)],
  ];
  return (
    <div ref={areaRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onPointerCancel={handlePointerLeave} className="p-4 sm:p-10 touch-pan-y select-none">
      <div ref={floatRef} className="animate-float" style={{ perspective: 1300 }}>
        <div ref={cardRef} className="relative max-w-[470px] mx-auto lg:ml-auto" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {[34, 17].map((layerOffset) => <div key={layerOffset} className="absolute inset-0 rounded-[1.1rem] border border-accent/30 bg-accent/5" style={depthStyle(-layerOffset)} />)}
          <div className="relative rounded-[1.1rem] border border-accent/40 p-5 sm:p-7 font-mono text-[11px] sm:text-[13px]"
            style={{ transformStyle: 'preserve-3d', background: 'linear-gradient(135deg,rgb(var(--card)/.92),rgb(var(--card)/.7))', boxShadow: '0 0 90px rgb(var(--accent)/.3),0 30px 60px -20px rgb(0 0 0/.65),inset 0 1px 0 rgb(255 255 255/.12)' }}>
            <div className="flex gap-2 mb-5" style={depthStyle(46)}>{[1, 1, 0.45].map((dotOpacity, dotIndex) => <span key={dotIndex} className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" style={{ opacity: dotOpacity }} />)}</div>
            <div className="leading-7 sm:leading-8" style={depthStyle(30)}>
              <div className="flex gap-4"><span className="text-mute/50 w-3">1</span><span><span className="text-cyan-300">const</span> developer = {'{'}</span></div>
              {codeRows.map(([key, value], index) => (
                <div key={key} className="flex gap-4"><span className="text-mute/50 w-3">{index + 2}</span><span className="pl-5">{key}: {value},</span></div>
              ))}
              <div className="flex gap-4"><span className="text-mute/50 w-3">6</span><span>{'};'}</span></div>
            </div>
            <div className="mt-6 text-mute" style={depthStyle(20)}>{'// '}{props.footer} <span className="inline-block w-2 h-4 align-middle bg-accent animate-blink" /></div>
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none mix-blend-overlay" style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgb(255 255 255/.4),transparent 55%)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
