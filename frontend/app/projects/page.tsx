'use client';
/**
 * /projects — the Projects page.
 *
 * All of this page's code lives in this file (layout, text, small helpers).
 * Shared building blocks are imported from @/components, data from @/lib.
 * The URL /projects comes from this folder name; the 3D slide between pages is done by <SiteShell> (see components/SiteShell.tsx).
 */
import { ArrowUpRight, Github } from 'lucide-react';
import ScrollPage from '@/components/ScrollPage';
import TiltCard from '@/components/TiltCard';
import Icon from '@/components/Icon';
import { useData } from '@/components/DataProvider';
import { revealDelayStyle } from '@/lib/ui';
import { mediaUrl } from '@/lib/data';

export default function Projects() {
  const { projects } = useData();
  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={revealDelayStyle(0)}>Featured <span className="text-accent text-glow">Projects</span></h2>
      {projects.map((project, index) => (
        <TiltCard key={project.id} revealDelay={1} data-step className="group mt-8 grid md:grid-cols-2 gap-6 md:gap-10 p-5 sm:p-7 min-h-[52vh]" maxTilt={4}>
          <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-accent/30 via-accent2/10 to-transparent grid place-items-center min-h-[200px] ${index % 2 ? 'md:order-2' : ''}`}>
            {project.image_url
              ? <img src={mediaUrl(project.image_url)} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              : <div className="animate-float" style={{ animationDelay: `${index * -1.5}s` }}><Icon name={project.icon} size={96} className="text-accent drop-shadow-[0_0_25px_rgb(var(--accent))]" /></div>}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs text-accent tracking-widest">0{index + 1}</span>
            <h3 className="text-3xl font-semibold mt-1">{project.title}</h3>
            <p className="text-mute mt-1">{project.subtitle}</p>
            <p className="mt-5 leading-7 text-fg/85">{project.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
            <div className="mt-6 flex gap-3 text-sm">
              {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="btn-shine flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-black font-medium hover:scale-105 transition">Live <ArrowUpRight size={16} /></a>}
              {project.repo_url && <a href={project.repo_url} target="_blank" rel="noreferrer" className="glass !rounded-full flex items-center gap-2 px-5 py-2 hover:scale-105"><Github size={16} /> Code</a>}
            </div>
          </div>
        </TiltCard>
      ))}
    </ScrollPage>
  );
}
