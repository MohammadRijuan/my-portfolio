import type { CSSProperties } from 'react';
/** stagger delay for .reveal elements */
export const dl = (n: number) => ({ '--d': n } as CSSProperties);
