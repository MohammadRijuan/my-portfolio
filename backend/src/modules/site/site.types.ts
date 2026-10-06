import type { Settings } from '../settings/settings.types';
import type { Project } from '../projects/projects.types';
import type { Skill } from '../skills/skills.types';
import type { Experience } from '../experiences/experiences.types';

/** Everything the public website needs, returned by GET /api/site. */
export interface SiteData {
  /** Changes whenever content is edited in the CMS (see siteVersion.service.ts). */
  version: string;
  settings: Settings;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
}
