import { prisma } from '../../database/prisma';
import { isRecordNotFound, toId } from '../../utils/prismaHelpers';
import { limitText } from '../../utils/text';
import type { Skill, SkillInput } from './skills.types';
import { markSiteChanged } from '../site/siteVersion.service';

/** Cleans the CMS input (level is forced into 0-100). */
const skillData = (input: SkillInput) => ({
  name: limitText(input.name, 80),
  level: Math.min(100, Math.max(0, parseInt(String(input.level), 10) || 0)),
  category: limitText(input.category || 'Other', 60),
});

export async function listSkills(): Promise<Skill[]> {
  return prisma.skill.findMany({ orderBy: { id: 'asc' } });
}

export async function createSkill(input: SkillInput): Promise<Skill> {
  const createdSkill = await prisma.skill.create({ data: skillData(input) });
  await markSiteChanged();
  return createdSkill;
}

export async function updateSkill(id: string, input: SkillInput): Promise<Skill | null> {
  try {
    const updatedSkill = await prisma.skill.update({ where: { id: toId(id) }, data: skillData(input) });
    await markSiteChanged();
    return updatedSkill;
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

export async function deleteSkill(id: string): Promise<void> {
  await prisma.skill.deleteMany({ where: { id: toId(id) } });
  await markSiteChanged();
}
