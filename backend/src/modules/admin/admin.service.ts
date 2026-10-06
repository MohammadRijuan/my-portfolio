import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma';
import { HttpError } from '../../utils/httpError';
import { safeCompare } from '../../utils/safeCompare';
import type { AdminStats } from './admin.types';

const MAX_ATTEMPTS = 5; // wrong codes allowed per IP ...
const LOCK_MINUTES = 15; // ... within this many minutes

/** Checks the access code and returns a 12-hour token. 5 wrong attempts / 15 min / IP => locked. */
export async function login(code: string, ip: string): Promise<string> {
  const { ADMIN_CODE, JWT_SECRET } = process.env;
  if (!ADMIN_CODE || !JWT_SECRET) throw new HttpError(500, 'Server not configured');

  const attempts = await prisma.loginAttempt.count({
    where: { ip, created_at: { gt: new Date(Date.now() - LOCK_MINUTES * 60 * 1000) } },
  });
  if (attempts >= MAX_ATTEMPTS) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');

  if (!safeCompare(code, ADMIN_CODE)) {
    await prisma.loginAttempt.create({ data: { ip } });
    await prisma.loginAttempt.deleteMany({ where: { created_at: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    await new Promise((resolve) => setTimeout(resolve, 700)); // slows down guessing
    throw new HttpError(401, 'Wrong access code');
  }

  await prisma.loginAttempt.deleteMany({ where: { ip } });
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
}

/** Numbers for the CMS dashboard. */
export async function getStats(): Promise<AdminStats> {
  const [projects, skills, experiences, messages, unread] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.message.count(),
    prisma.message.count({ where: { read: false } }),
  ]);
  return { projects, skills, experiences, messages, unread };
}
