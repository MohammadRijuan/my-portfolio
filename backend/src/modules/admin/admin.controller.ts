import type { Request, Response } from 'express';
import { getVisitorIp } from '../../utils/request';
import * as service from './admin.service';

export async function login(req: Request, res: Response) {
  const token = await service.login(String(req.body.code || ''), getVisitorIp(req));
  res.json({ token });
}

export function verify(req: Request, res: Response) {
  res.json({ ok: true });
}

export async function stats(req: Request, res: Response) {
  res.json(await service.getStats());
}
