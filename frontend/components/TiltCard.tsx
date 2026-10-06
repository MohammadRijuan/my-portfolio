'use client';
import { useRef, ReactNode, HTMLAttributes } from 'react';
import { revealDelayStyle } from '@/lib/ui';

type TiltCardProps = { children: ReactNode; className?: string; maxTilt?: number; revealDelay?: number } & HTMLAttributes<HTMLDivElement>;
/** Glass card: 3D tilt + cursor spotlight. Pass `d` for a staggered reveal. */
export default function TiltCard({ children, className = '', maxTilt = 8, revealDelay, ...rest }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (event: React.MouseEvent) => {
    const cardElement = cardRef.current!, cardRect = cardElement.getBoundingClientRect();
    const offsetX = (event.clientX - cardRect.left) / cardRect.width - 0.5, offsetY = (event.clientY - cardRect.top) / cardRect.height - 0.5;
    cardElement.style.setProperty('--mx', `${event.clientX - cardRect.left}px`); cardElement.style.setProperty('--my', `${event.clientY - cardRect.top}px`);
    cardElement.style.transform = `perspective(900px) rotateY(${offsetX * maxTilt}deg) rotateX(${-offsetY * maxTilt}deg) translateZ(6px)`;
  };
  const cardContent = (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={() => { cardRef.current!.style.transform = ''; }} className={`glass will-change-transform ${revealDelay !== undefined ? 'h-full' : ''} ${className}`} {...rest}>{children}</div>
  );
  return revealDelay === undefined ? cardContent : <div className="reveal h-full" style={revealDelayStyle(revealDelay)}>{cardContent}</div>;
}
