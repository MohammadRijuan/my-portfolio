/** An experience row (shape comes from model Experience in prisma/schema.prisma). */
export type { Experience } from '@prisma/client';

/** What the CMS sends when creating / editing an experience (loosely typed, cleaned in the service). */
export interface ExperienceInput {
  company?: unknown;
  logo_url?: unknown;
  role?: unknown;
  emp_type?: unknown;
  location?: unknown;
  work_mode?: unknown;
  start_date?: unknown; // "YYYY-MM"
  end_date?: unknown; // "YYYY-MM", ignored when current
  current?: unknown;
  description?: unknown;
  tech?: unknown; // array or comma separated text
  url?: unknown;
}
