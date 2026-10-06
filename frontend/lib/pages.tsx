import type { PageDef } from '@/components/pager/types';
import Home from '@/app/home/page';
import About from '@/app/about/page';
import Projects from '@/app/projects/page';
import Skills from '@/app/skills/page';
import Experience from '@/app/experience/page';
import Contact from '@/app/contact/page';

/**
 * The site's pages, in navbar / slide order.
 * Each page's code lives in its own route file (app/about/page.tsx -> URL /about).
 * `id` must match the route folder name.
 * To add a page: create app/<id>/page.tsx (copy an existing one), then add a line here.
 */
export const PAGES: PageDef[] = [
  { id: 'home', label: 'Home', node: <Home /> },
  { id: 'about', label: 'About', node: <About /> },
  { id: 'projects', label: 'Projects', node: <Projects /> },
  { id: 'skills', label: 'Skills', node: <Skills /> },
  { id: 'experience', label: 'Experience', node: <Experience /> },
  { id: 'contact', label: 'Contact', node: <Contact /> },
];
