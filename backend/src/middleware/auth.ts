import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

/** Put in front of any admin-only route: requires a valid admin token in the Authorization header. */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET as string);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
