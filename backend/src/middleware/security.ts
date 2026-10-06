import type { NextFunction, Request, Response } from 'express';

/** Basic security headers on every response. */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex',
  });
  next();
};
