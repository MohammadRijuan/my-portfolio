'use client';
import type { PageDef } from './types';

type Props = { pages: PageDef[]; index: number; open: boolean; onGoToPage: (requestedIndex: number) => void };

/** Full-screen menu shown on mobile / tablet. */
export default function MobileMenu({ pages, index, open, onGoToPage }: Props) {
  return (
    <div
      className={`md:hidden fixed inset-0 z-40 bg-bg/90 backdrop-blur-xl flex flex-col items-center justify-center gap-7 transition-all duration-500 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {pages.map((page, pageIndex) => (
        <button
          key={page.id}
          onClick={() => onGoToPage(pageIndex)}
          className={`text-3xl font-semibold transition-all duration-500 ${pageIndex === index ? 'text-accent' : 'text-fg'}`}
          style={{ transitionDelay: open ? `${pageIndex * 60}ms` : '0ms', transform: open ? 'none' : 'translateY(20px)' }}
        >
          {page.label}
        </button>
      ))}
    </div>
  );
}
