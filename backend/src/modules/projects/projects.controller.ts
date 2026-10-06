import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import * as service from './projects.service';

export async function list(req: Request, res: Response) {
  res.json(await service.listProjects());
}

export async function create(req: Request, res: Response) {
  if (!req.body.title) throw new HttpError(400, 'title required');
  res.status(201).json(await service.createProject(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateProject(req.params.id, req.body));
}

export async function remove(req: Request, res: Response) {
  await service.deleteProject(req.params.id);
  res.json({ ok: true });
}

export async function reorder(req: Request, res: Response) {
  await service.reorderProjects(Array.isArray(req.body.ids) ? req.body.ids : []);
  res.json({ ok: true });
}
