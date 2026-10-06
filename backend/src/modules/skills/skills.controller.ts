import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import * as service from './skills.service';

export async function list(req: Request, res: Response) {
  res.json(await service.listSkills());
}

export async function create(req: Request, res: Response) {
  if (!req.body.name) throw new HttpError(400, 'name required');
  res.status(201).json(await service.createSkill(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateSkill(req.params.id, req.body));
}

export async function remove(req: Request, res: Response) {
  await service.deleteSkill(req.params.id);
  res.json({ ok: true });
}
