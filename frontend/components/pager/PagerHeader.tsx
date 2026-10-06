'use client';
import { Sun, Moon, Code2, Menu, X } from 'lucide-react';
import type { PageDef } from './types';

type Props = {
  pages: PageDef[];
  index: number;
  logoText: string;
  scrolled: boolean;
  light: boolean;
  menuOpen: boolean;
  onGoToPage: (requestedIndex: number) => void;
  onToggleTheme: () => void;
  onToggleMenu: () => void;
};

/** Sticky blurred navbar: logo, page links (desktop), Dark/Light switch and the mobile menu button. */
export default function PagerHeader({ pages, index, logoText, scrolled, light, menuOpen, onGoToPage, onToggleTheme, onToggleMenu }: Props) {
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-20 backdrop-blur-md border-b transition-all duration-500 ${
        scrolled
          ? 'bg-bg/70 backdrop-blur-xl border-accent/15 shadow-[0_10px_40px_-20px_rgb(0_0_0/.8)]'
          : 'bg-bg/10 border-transparent'
      }`}
    >
      <div className="relative mx-auto h-full max-w-[1440px] flex items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
        <button onClick={() => onGoToPage(0)} className="group flex items-center gap-3 font-semibold text-lg">
          <Code2 className="text-accent group-hover:rotate-12 group-hover:scale-110 transition" size={30} />
          {logoText}
        </button>

        <nav className="hidden md:flex gap-6 lg:gap-9 text-sm absolute left-1/2 -translate-x-1/2">
          {pages.map((page, pageIndex) => (
            <button
              key={page.id}
              onClick={() => onGoToPage(pageIndex)}
              className={`relative py-2 transition-all hover:-translate-y-0.5 ${pageIndex === index ? 'text-accent' : 'text-fg/80 hover:text-accent'}`}
            >
              {page.label}
              <span
                className={`absolute left-0 -bottom-0.5 h-0.5 rounded bg-accent shadow-[0_0_10px_rgb(var(--accent))] transition-all duration-500 ${
                  pageIndex === index ? 'w-full' : 'w-0'
                }`}
              />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="glass btn-shine !rounded-full px-3 sm:px-4 py-2 text-xs flex items-center gap-2 hover:scale-105"
          >
            {light ? <Moon size={14} className="text-accent" /> : <Sun size={14} className="text-accent" />}
            <span className="hidden sm:inline">Dark / Light</span>
          </button>
          <button onClick={onToggleMenu} aria-label="Menu" className="md:hidden glass !rounded-full p-2.5">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
