'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Pager from './Pager';
import { PAGES } from '@/lib/pages';

/**
 * Decides what the root layout shows:
 *  - /home, /about, /projects, … -> the Pager, which shows every page component (the default export of
 *    app/<page>/page.tsx) side by side so they can slide into each other
 *  - anything else (/admin, 404)  -> the normal Next.js page for that route (`children`)
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSitePage = PAGES.some((page) => `/${page.id}` === pathname);
  return isSitePage ? <Pager pages={PAGES} /> : <>{children}</>;
}
