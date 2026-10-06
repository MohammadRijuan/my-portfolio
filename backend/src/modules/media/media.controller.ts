import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { getMedia, saveMedia } from './media.service';
import { ALLOWED_MEDIA_TYPES } from './media.types';

/** POST /upload — body is the raw file; the original file name arrives in the X-File-Name header. */
export async function upload(req: Request, res: Response) {
  const mime = (req.headers['content-type'] || '').split(';')[0];
  if (!ALLOWED_MEDIA_TYPES.includes(mime) || !Buffer.isBuffer(req.body) || !req.body.length) {
    throw new HttpError(400, 'Unsupported file (use JPG, PNG, WebP or PDF, max 4MB)');
  }

  let name = '';
  try { name = decodeURIComponent(String(req.headers['x-file-name'] || '')); } catch {}
  name = name.replace(/[^\w.\- ]/g, '_').slice(0, 100);

  const mediaId = await saveMedia(mime, req.body, name);
  res.status(201).json({ id: mediaId, url: `/api/media/${mediaId}` });
}

/** GET /media/:id — serves the file; add ?download=1 to force a download. */
export async function serve(req: Request, res: Response) {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).end();
  const file = await getMedia(req.params.id);
  if (!file) return res.status(404).end();

  const { mime, data, name } = file;
  const headers: Record<string, string> = { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' };
  if (req.query.download) {
    headers['Content-Disposition'] = `attachment; filename="${name || (mime === 'application/pdf' ? 'CV.pdf' : 'file')}"`;
  }
  res.set(headers).send(data);
}
