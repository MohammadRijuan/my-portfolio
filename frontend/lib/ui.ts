import type { CSSProperties } from 'react';
/** stagger delay for .reveal elements */
export const revealDelayStyle = (delayStep: number) => ({ '--d': delayStep } as CSSProperties);
