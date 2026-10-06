/** A skill row (shape comes from model Skill in prisma/schema.prisma). */
export type { Skill } from '@prisma/client';

/** What the CMS sends when creating / editing a skill. */
export interface SkillInput {
  name?: unknown;
  level?: unknown;
  category?: unknown;
}
