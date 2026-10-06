import { prisma } from '../../database/prisma';
import type { MediaFile } from './media.types';

export async function saveMedia(mime: string, data: Buffer, name: string): Promise<number> {
  const saved = await prisma.media.create({
    data: { mime, data: new Uint8Array(data), name },
    select: { id: true },
  });
  return saved.id;
}

export async function getMedia(id: string): Promise<MediaFile | null> {
  const file = await prisma.media.findUnique({ where: { id: Number(id) }, select: { mime: true, data: true, name: true } });
  // Prisma returns the bytes as Uint8Array; Express needs a Buffer to send them as a file.
  return file ? { mime: file.mime, name: file.name, data: Buffer.from(file.data) } : null;
}
