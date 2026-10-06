import type { Request, Response } from 'express';
import { updateSettings } from './settings.service';

export async function update(req: Request, res: Response) {
  res.json(await updateSettings(req.body));
}
