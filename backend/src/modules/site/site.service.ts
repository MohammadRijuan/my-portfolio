import { getSettings } from '../settings/settings.service';
import { listProjects } from '../projects/projects.service';
import { listSkills } from '../skills/skills.service';
import { listExperiences } from '../experiences/experiences.service';
import { getSiteVersion } from './siteVersion.service';
import type { SiteData } from './site.types';

/** Loads the content version, then settings + projects + skills + experiences in parallel. */
export async function getSiteData(): Promise<SiteData> {
  // The version is read FIRST, so the content that follows is always at least as new as this version.
  const version = await getSiteVersion();
  const [settings, projects, skills, experiences] = await Promise.all([
    getSettings(),
    listProjects(),
    listSkills(),
    listExperiences(),
  ]);
  return { version, settings, projects, skills, experiences };
}
