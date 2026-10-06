import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

/** Last stop for errors: known HttpErrors keep their status/message, everything else becomes a generic 500. */
export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Server error' });
};
