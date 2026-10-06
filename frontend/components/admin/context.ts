'use client';
import { createContext } from 'react';

/** Admin JWT, used by upload fields. */
export const TokenCtx = createContext('');
/** Shows a toast: flash('Saved') or flash('Failed', 'err'). */
export const ToastCtx = createContext<(message: string, type?: 'ok' | 'err') => void>(() => {});
