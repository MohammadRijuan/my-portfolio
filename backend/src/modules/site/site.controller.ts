import type { Request, Response } from 'express';
import { getSiteData } from './site.service';
import { getSiteVersion } from './siteVersion.service';

export function health(req: Request, res: Response) {
  res.json({ ok: true });
}

export async function getSite(req: Request, res: Response) {
  const data = await getSiteData();
  res.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60').json(data);
}

/** Tiny answer asked by every open page of the website every few seconds: "has the content changed?" */
export async function getVersion(req: Request, res: Response) {
  const version = await getSiteVersion();
  // Shared caches (Vercel) may keep it for 2 seconds, so many visitors cost almost nothing.
  res.set('Cache-Control', 'public, s-maxage=2').json({ version });
}
