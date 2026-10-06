import type { Request, Response } from 'express';
import { HttpError } from '../../utils/httpError';
import { getVisitorIp } from '../../utils/request';
import { limitText } from '../../utils/text';
import { saveContactMessage } from './contact.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();

export async function submit(req: Request, res: Response) {
  const { name, message, website } = req.body;
  if (website) return res.status(201).json({ ok: true }); // hidden "honeypot" field: only bots fill it

  const email = normalizeEmail(req.body.email);
  if (!name || !EMAIL_RE.test(email) || !message || String(message).length > 3000) {
    throw new HttpError(400, 'Please fill in all fields correctly.');
  }

  await saveContactMessage({ name: limitText(name, 120), email, message: limitText(message, 3000) }, getVisitorIp(req));
  res.status(201).json({ ok: true });
}
