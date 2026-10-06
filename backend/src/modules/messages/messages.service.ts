import { prisma } from '../../database/prisma';
import { toId } from '../../utils/prismaHelpers';
import type { Message } from './messages.types';

export async function listMessages(): Promise<Message[]> {
  return prisma.message.findMany({ orderBy: { id: 'desc' } });
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  await prisma.message.updateMany({ where: { id: toId(id) }, data: { read } });
}

export async function deleteMessage(id: string): Promise<void> {
  await prisma.message.deleteMany({ where: { id: toId(id) } });
}
