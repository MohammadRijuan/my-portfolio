import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/** node-postgres does not support Neon's channel_binding option, so it is removed from the URL. */
function cleanConnectionString(connectionString?: string): string | undefined {
  if (!connectionString) return connectionString;
  const url = new URL(connectionString);
  url.searchParams.delete('channel_binding');
  return url.toString();
}

/**
 * The one Prisma client used by every service (import { prisma } from '../../database/prisma').
 * It talks to Neon through the pg driver adapter, with at most 3 connections (serverless friendly).
 * The tables are described in prisma/schema.prisma.
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: cleanConnectionString(process.env.DATABASE_URL), max: 3 }),
});

// Not executed for any purpose: this line only tells Vercel's file bundler to ship Prisma's query-compiler file
// with the function (Prisma reads it at runtime, so it cannot be detected automatically). Keep it.
path.join(process.cwd(), 'node_modules/.prisma/client/query_compiler_bg.wasm');
