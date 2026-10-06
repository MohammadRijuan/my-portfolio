import { randomUUID } from 'crypto';
import { prisma } from '../../database/prisma';

/** The settings-table row that holds the current content version (separate from the 'site' settings row). */
const SITE_VERSION_KEY = 'site_version';

/**
 * A short code that changes every time site content is edited in the CMS.
 * Open pages of the website ask for this code every few seconds; when it differs from the one they know,
 * they download the new content. '0' means "no change has been made yet".
 */
export async function getSiteVersion(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: SITE_VERSION_KEY } });
  return typeof row?.value === 'string' ? row.value : '0';
}

/** Call this after any change that visitors can see (project, skill, experience or settings edited / added / deleted). */
export async function markSiteChanged(): Promise<void> {
  const newVersion = randomUUID().slice(0, 8);
  await prisma.setting.upsert({
    where: { key: SITE_VERSION_KEY },
    create: { key: SITE_VERSION_KEY, value: newVersion },
    update: { value: newVersion },
  });
}
