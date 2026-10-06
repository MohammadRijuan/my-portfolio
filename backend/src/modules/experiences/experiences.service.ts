import { prisma } from '../../database/prisma';
import { isRecordNotFound, toId } from '../../utils/prismaHelpers';
import { splitIntoList, limitText } from '../../utils/text';
import type { Experience, ExperienceInput } from './experiences.types';
import { markSiteChanged } from '../site/siteVersion.service';

/** Cleans the CMS input into the column values. */
const experienceData = (input: ExperienceInput) => ({
  company: limitText(input.company, 200),
  logo_url: limitText(input.logo_url, 1000),
  role: limitText(input.role, 200),
  emp_type: limitText(input.emp_type || 'Full-time', 40),
  location: limitText(input.location, 120),
  work_mode: limitText(input.work_mode, 40),
  start_date: limitText(input.start_date, 10),
  end_date: input.current ? '' : limitText(input.end_date, 10),
  current: !!input.current,
  description: limitText(input.description, 3000),
  tech: splitIntoList(input.tech),
  url: limitText(input.url, 500),
});

/** Current job first, then newest start date. */
export const experiencesOrder = [{ current: 'desc' as const }, { start_date: 'desc' as const }, { id: 'desc' as const }];

export async function listExperiences(): Promise<Experience[]> {
  return prisma.experience.findMany({ orderBy: experiencesOrder });
}

export async function createExperience(input: ExperienceInput): Promise<Experience> {
  const createdExperience = await prisma.experience.create({ data: experienceData(input) });
  await markSiteChanged();
  return createdExperience;
}

export async function updateExperience(id: string, input: ExperienceInput): Promise<Experience | null> {
  try {
    const updatedExperience = await prisma.experience.update({ where: { id: toId(id) }, data: experienceData(input) });
    await markSiteChanged();
    return updatedExperience;
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

export async function deleteExperience(id: string): Promise<void> {
  await prisma.experience.deleteMany({ where: { id: toId(id) } });
  await markSiteChanged();
}
