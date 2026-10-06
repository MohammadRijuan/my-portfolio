/** A project row (shape comes from model Project in prisma/schema.prisma). */
export type { Project } from '@prisma/client';

/** What the CMS sends when creating / editing a project (loosely typed, cleaned in the service). */
export interface ProjectInput {
  title?: unknown;
  subtitle?: unknown;
  description?: unknown;
  tags?: unknown; // array or comma separated text
  live_url?: unknown;
  repo_url?: unknown;
  image_url?: unknown;
  icon?: unknown;
  featured?: unknown;
}
