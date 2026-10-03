'use client';
import { useRef, ReactNode, HTMLAttributes } from 'react';
import { dl } from '@/lib/ui';

type P = { children: ReactNode; className?: string; max?: number; d?: number } & HTMLAttributes<HTMLDivElement>;
/** Glass card: 3D tilt + cursor spotlight. Pass `d` for a staggered reveal. */
export default function TiltCard({ children, className = '', max = 8, d, ...rest }: P) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current!, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(6px)`;
  };
  const card = (
    <div ref={ref} onMouseMove={move} onMouseLeave={() => { ref.current!.style.transform = ''; }} className={`glass will-change-transform ${d !== undefined ? 'h-full' : ''} ${className}`} {...rest}>{children}</div>
  );
  return d === undefined ? card : <div className="reveal h-full" style={dl(d)}>{card}</div>;
}
