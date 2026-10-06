import type { Request, Response } from 'express';
import * as service from './messages.service';

export async function list(req: Request, res: Response) {
  res.json(await service.listMessages());
}

export async function markRead(req: Request, res: Response) {
  await service.setMessageRead(req.params.id, req.body.read !== false);
  res.json({ ok: true });
}

export async function remove(req: Request, res: Response) {
  await service.deleteMessage(req.params.id);
  res.json({ ok: true });
}
