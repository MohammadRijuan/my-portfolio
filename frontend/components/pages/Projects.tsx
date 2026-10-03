'use client';
import { ArrowUpRight, Github } from 'lucide-react';
import ScrollPage from '../ScrollPage';
import TiltCard from '../TiltCard';
import Icon from '../Icon';
import { useData } from '../DataProvider';
import { dl } from '@/lib/ui';
import { img } from '@/lib/data';

export default function Projects() {
  const { projects } = useData();
  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={dl(0)}>Featured <span className="text-accent text-glow">Projects</span></h2>
      {projects.map((p, k) => (
        <TiltCard key={p.id} d={1} data-step className="group mt-8 grid md:grid-cols-2 gap-6 md:gap-10 p-5 sm:p-7 min-h-[52vh]" max={4}>
          <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-accent/30 via-accent2/10 to-transparent grid place-items-center min-h-[200px] ${k % 2 ? 'md:order-2' : ''}`}>
            {p.image_url
              ? <img src={img(p.image_url)} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              : <div className="animate-float" style={{ animationDelay: `${k * -1.5}s` }}><Icon name={p.icon} size={96} className="text-accent drop-shadow-[0_0_25px_rgb(var(--accent))]" /></div>}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs text-accent tracking-widest">0{k + 1}</span>
            <h3 className="text-3xl font-semibold mt-1">{p.title}</h3>
            <p className="text-mute mt-1">{p.subtitle}</p>
            <p className="mt-5 leading-7 text-fg/85">{p.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <div className="mt-6 flex gap-3 text-sm">
              {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="btn-shine flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-black font-medium hover:scale-105 transition">Live <ArrowUpRight size={16} /></a>}
              {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="glass !rounded-full flex items-center gap-2 px-5 py-2 hover:scale-105"><Github size={16} /> Code</a>}
            </div>
          </div>
        </TiltCard>
      ))}
    </ScrollPage>
  );
}
