import { prisma } from './prisma';
import { defaults } from './defaults';

/**
 * Safety net: creates the tables when they are missing and adds columns that older databases may lack.
 * Every statement is "if not exists", so on your existing database it changes nothing.
 * It mirrors prisma/schema.prisma — if you add a table/column there, add it here too.
 */
const ENSURE_TABLES = [
  `create table if not exists projects(id serial primary key, title text not null, subtitle text default '', description text default '', tags text[] default '{}', live_url text default '', repo_url text default '', image_url text default '', icon text default 'code', featured boolean default true, position int default 0, created_at timestamptz default now())`,
  `alter table projects add column if not exists image_url text default ''`,
  `alter table projects add column if not exists featured boolean default true`,
  `create table if not exists skills(id serial primary key, name text not null, level int default 80, category text default 'Other')`,
  `create table if not exists messages(id serial primary key, name text, email text, message text, read boolean default false, created_at timestamptz default now())`,
  `alter table messages add column if not exists read boolean default false`,
  `alter table messages add column if not exists notified boolean default false`,
  `alter table messages add column if not exists ip text`,
  `create table if not exists media(id serial primary key, mime text not null, data bytea not null, created_at timestamptz default now())`,
  `alter table media add column if not exists name text`,
  `create table if not exists experiences(id serial primary key, company text not null, logo_url text default '', role text not null, emp_type text default 'Full-time', location text default '', work_mode text default '', start_date text default '', end_date text default '', current boolean default false, description text default '', tech text[] default '{}', url text default '', created_at timestamptz default now())`,
  `create table if not exists email_otps(id serial primary key, email text not null, code_hash text not null, attempts int default 0, ip text, created_at timestamptz default now(), expires_at timestamptz not null)`,
  `create table if not exists settings(key text primary key, value jsonb not null)`,
  `create table if not exists login_attempts(id serial primary key, ip text, created_at timestamptz default now())`,
];

let ready: Promise<void> | null = null;

/** Runs once per server start: makes sure the tables exist, then seeds default content into an empty database. */
export function init(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      for (const statement of ENSURE_TABLES) await prisma.$executeRawUnsafe(statement);

      // Default projects / skills / settings (only when the tables are empty).
      if (!(await prisma.project.findFirst({ select: { id: true } }))) {
        for (const [position, project] of defaults.projects.entries()) {
          await prisma.project.create({ data: { ...project, position: position } });
        }
      }
      if (!(await prisma.skill.findFirst({ select: { id: true } }))) {
        await prisma.skill.createMany({ data: defaults.skills });
      }
      await prisma.setting.createMany({ data: [{ key: 'site', value: defaults.settings }], skipDuplicates: true });
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
