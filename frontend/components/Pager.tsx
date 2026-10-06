'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useData } from './DataProvider';
import PagerHeader from './pager/PagerHeader';
import MobileMenu from './pager/MobileMenu';
import { usePagerInput } from './pager/usePagerInput';
import type { PageDef } from './pager/types';

export type { PageDef } from './pager/types';

/** Lets any page jump to another one by id: `const go = useNav(); go('projects')`. */
const PageNavigationContext = createContext<(id: string) => void>(() => {});
export const useGoToPage = () => useContext(PageNavigationContext);

const SWITCH_LOCK_MS = 1000;
const pathFor = (id: string) => `/${id}`;

/**
 * Slides between the site's pages with the 3D transition.
 * Navigation uses normal Next.js routing: moving to another page calls router.push('/about'),
 * and the page shown always follows the URL (so Back / Forward and direct links work too).
 */
export default function Pager({ pages: allPages }: { pages: PageDef[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useData();
  const hiddenPageIds = settings.hidden_pages.split(',').map((hiddenId) => hiddenId.trim());
  const pages = allPages.filter((page) => !hiddenPageIds.includes(page.id));

  const [currentId, setCurrentId] = useState(pathname.slice(1));
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const switchLockedUntil = useRef(0);

  // Active page index; falls back to the first page when the URL points at a hidden/unknown page.
  const index = Math.max(0, pages.findIndex((page) => page.id === currentId));
  const activeId = pages[index].id;

  const goToPage = (requestedIndex: number) => {
    const targetIndex = Math.max(0, Math.min(pages.length - 1, requestedIndex));
    setIsMenuOpen(false);
    if (targetIndex === index) return;
    switchLockedUntil.current = Date.now() + SWITCH_LOCK_MS;
    setCurrentId(pages[targetIndex].id); // start the slide right away
    router.push(pathFor(pages[targetIndex].id), { scroll: false }); // and update the URL
  };
  const goToPageById = (id: string) => goToPage(pages.findIndex((page) => page.id === id));

  const { onWheel, onTouchStart, onTouchEnd } = usePagerInput({ containerRef, index, switchLockedUntil, goToPage });

  // URL -> page (Back / Forward buttons, links typed by hand).
  useEffect(() => { setCurrentId(pathname.slice(1)); }, [pathname]);

  // If the URL names a page that is hidden in the CMS, we show the first visible page and fix the URL.
  useEffect(() => {
    if (currentId !== activeId) router.replace(pathFor(activeId), { scroll: false });
  }, [currentId, activeId]);

  // Remember the saved colour mode, and support old "/#about" style links.
  useEffect(() => {
    setIsLightMode(document.documentElement.classList.contains('light'));
    const legacyHashPageId = location.hash.slice(1);
    if (pages.some((page) => page.id === legacyHashPageId)) router.replace(pathFor(legacyHashPageId), { scroll: false });
  }, []);

  // Navbar gets its solid look once the active page is scrolled.
  useEffect(() => {
    const activeScroller = containerRef.current?.querySelector<HTMLElement>(`[data-page="${index}"] [data-scroller]`);
    setIsScrolled((activeScroller?.scrollTop || 0) > 8);
  }, [index]);

  const toggleTheme = () => {
    const nextIsLight = !isLightMode;
    setIsLightMode(nextIsLight);
    document.documentElement.classList.toggle('light', nextIsLight);
    try { localStorage.setItem('theme', nextIsLight ? 'light' : 'dark'); } catch {}
  };

  return (
    <PageNavigationContext.Provider value={goToPageById}>
      <div
        ref={containerRef}
        onWheel={onWheel}
        onScrollCapture={(event) => {
          const scrollerElement = event.target as HTMLElement;
          if (scrollerElement.hasAttribute?.('data-scroller')) setIsScrolled(scrollerElement.scrollTop > 8);
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="fixed inset-0 z-10 overflow-hidden"
        style={{ perspective: '1800px' }}
      >
        <PagerHeader
          pages={pages}
          index={index}
          logoText={settings.logo_text}
          scrolled={isScrolled}
          light={isLightMode}
          menuOpen={isMenuOpen}
          onGoToPage={goToPage}
          onToggleTheme={toggleTheme}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />
        <MobileMenu pages={pages} index={index} open={isMenuOpen} onGoToPage={goToPage} />

        {pages.map((page, pageIndex) => {
          const offset = pageIndex - index;
          return (
            <div
              key={page.id}
              data-page={pageIndex}
              data-active={offset === 0}
              aria-hidden={offset !== 0}
              className="absolute inset-0"
              style={{
                transform: `translate3d(${offset * 100}%,0,0) rotateY(${offset * -26}deg) scale(${offset === 0 ? 1 : 0.8})`,
                transformOrigin: offset > 0 ? 'left center' : 'right center',
                opacity: offset === 0 ? 1 : 0,
                pointerEvents: offset === 0 ? 'auto' : 'none',
                transition: 'transform 1s cubic-bezier(.77,0,.18,1), opacity .7s ease',
              }}
            >
              {page.node}
            </div>
          );
        })}
      </div>
    </PageNavigationContext.Provider>
  );
}
