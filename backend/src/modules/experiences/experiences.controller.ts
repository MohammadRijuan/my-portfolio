import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import * as service from './experiences.service';

export async function list(req: Request, res: Response) {
  res.json(await service.listExperiences());
}

export async function create(req: Request, res: Response) {
  if (!req.body.company || !req.body.role) throw new HttpError(400, 'company and designation required');
  res.status(201).json(await service.createExperience(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateExperience(req.params.id, req.body));
}

export async function remove(req: Request, res: Response) {
  await service.deleteExperience(req.params.id);
  res.json({ ok: true });
}
