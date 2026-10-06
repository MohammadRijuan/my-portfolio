import type { Request } from 'express';

/** Visitor IP (first x-forwarded-for entry on Vercel). */
export const getVisitorIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
