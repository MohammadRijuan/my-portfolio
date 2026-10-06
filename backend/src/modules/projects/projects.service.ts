import { prisma } from '../../database/prisma';
import { isRecordNotFound, toId } from '../../utils/prismaHelpers';
import { splitIntoList, limitText } from '../../utils/text';
import type { Project, ProjectInput } from './projects.types';
import { markSiteChanged } from '../site/siteVersion.service';

/** Cleans the CMS input into the column values. */
const projectData = (input: ProjectInput) => ({
  title: limitText(input.title, 200),
  subtitle: limitText(input.subtitle, 200),
  description: limitText(input.description),
  tags: splitIntoList(input.tags),
  live_url: limitText(input.live_url, 500),
  repo_url: limitText(input.repo_url, 500),
  image_url: limitText(input.image_url, 1000),
  icon: limitText(input.icon || 'code', 40),
  featured: input.featured !== false,
});

/** Order shown on the site: CMS order (position), then id. */
export const projectsOrder = [{ position: 'asc' as const }, { id: 'asc' as const }];

export async function listProjects(): Promise<Project[]> {
  return prisma.project.findMany({ orderBy: projectsOrder });
}

/** New projects go to the end of the list. */
export async function createProject(input: ProjectInput): Promise<Project> {
  const last = await prisma.project.aggregate({ _max: { position: true } });
  const createdProject = await prisma.project.create({ data: { ...projectData(input), position: (last._max.position ?? 0) + 1 } });
  await markSiteChanged();
  return createdProject;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project | null> {
  try {
    const updatedProject = await prisma.project.update({ where: { id: toId(id) }, data: projectData(input) });
    await markSiteChanged();
    return updatedProject;
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.project.deleteMany({ where: { id: toId(id) } });
  await markSiteChanged();
}

/** `ids` is the project ids in their new order. */
export async function reorderProjects(ids: unknown[]): Promise<void> {
  for (const [position, id] of ids.entries()) {
    await prisma.project.updateMany({ where: { id: Number(id) }, data: { position: position } });
  }
  await markSiteChanged();
}
