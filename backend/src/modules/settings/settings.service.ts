import type { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { defaults } from '../../database/defaults';
import type { Settings } from './settings.types';
import { markSiteChanged } from '../site/siteVersion.service';

/** Saved settings merged over the defaults (so new keys always have a value). */
export async function getSettings(): Promise<Settings> {
  const row = await prisma.setting.findUnique({ where: { key: 'site' } });
  return { ...defaults.settings, ...((row?.value as object) ?? {}) };
}

/** Saves only the keys that exist in defaults.json; unknown keys are ignored. */
export async function updateSettings(input: Record<string, unknown>): Promise<Settings> {
  const clean: Record<string, unknown> = {};
  for (const settingKey of Object.keys(defaults.settings)) if (settingKey in input) clean[settingKey] = input[settingKey];

  const next = { ...(await getSettings()), ...clean };
  const value = next as unknown as Prisma.InputJsonValue;
  await prisma.setting.upsert({
    where: { key: 'site' },
    create: { key: 'site', value },
    update: { value },
  });
  await markSiteChanged();
  return next;
}
