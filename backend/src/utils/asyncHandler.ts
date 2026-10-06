import type { NextFunction, Request, Response } from 'express';

/** Wraps an async controller so a thrown error reaches the error middleware instead of crashing the request. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
