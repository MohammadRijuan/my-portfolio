import { Prisma } from '@prisma/client';

/** URL ids arrive as text; the database ids are numbers. A non-number makes Prisma throw -> generic 500 (as before). */
export const toId = (id: string): number => Number(id);

/** True when Prisma could not find the row it was asked to update. */
export const isRecordNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
