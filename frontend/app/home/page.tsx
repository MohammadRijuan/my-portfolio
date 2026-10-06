'use client';
/**
 * /home — the Home page.
 *
 * All of this page's code lives in this file (layout, text, small helpers).
 * Shared building blocks are imported from @/components, data from @/lib.
 * The URL /home comes from this folder name; the 3D slide between pages is done by <SiteShell> (see components/SiteShell.tsx).
 */
import { useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import ScrollPage from '@/components/ScrollPage';
import ScrollHint from '@/components/ScrollHint';
import TiltCard from '@/components/TiltCard';
import DevCard from '@/components/DevCard';
import Icon from '@/components/Icon';
import { useGoToPage } from '@/components/Pager';
import { useData } from '@/components/DataProvider';
import { revealDelayStyle } from '@/lib/ui';
import { mediaUrl, downloadUrl } from '@/lib/data';

export default function Home() {
  const goToPage = useGoToPage();
  const { settings, projects, skills } = useData();
  const [showCvNotice, setShowCvNotice] = useState(false);
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const projectsToShow = featuredProjects.length ? featuredProjects : projects.slice(0, 3);

  return (
    <>
      <ScrollPage rail={false}>
        {/* HERO */}
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-2 lg:gap-10 items-center lg:min-h-[430px] lg:px-[2%]">
          <div>
            <span className="reveal glass !rounded-full inline-flex items-center gap-2 px-4 py-1.5 text-sm" style={revealDelayStyle(0)}>👋 {settings.badge}</span>
            <h1 className="reveal mt-4 text-[2.6rem] sm:text-6xl lg:text-[3.6rem] leading-[1.05] font-extrabold tracking-tight" style={revealDelayStyle(1)}>
              {settings.name_main} <span className="text-accent text-glow">{settings.name_accent}</span>
            </h1>
            <h2 className="reveal mt-4 text-2xl sm:text-4xl font-medium" style={revealDelayStyle(2)}>{settings.role}</h2>
            <p className="reveal mt-5 text-fg/80 max-w-md leading-7" style={revealDelayStyle(3)}>{settings.tagline}</p>
            <div className="reveal mt-8 flex flex-wrap gap-4" style={revealDelayStyle(4)}>
              <button onClick={() => goToPage('projects')} className="btn-shine group flex items-center gap-3 px-7 py-3 rounded-full font-medium text-black bg-gradient-to-r from-accent to-accent2 shadow-[0_0_30px_rgb(var(--accent)/.4)] hover:scale-105 hover:shadow-[0_0_45px_rgb(var(--accent)/.6)] transition">
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" /> {settings.cta_label}
              </button>
              <a href={downloadUrl(settings.cv_url)} download onClick={(event) => { if (!settings.cv_url) { event.preventDefault(); setShowCvNotice(true); setTimeout(() => setShowCvNotice(false), 3000); } }} className="btn-shine glass group !rounded-full flex items-center gap-3 px-7 py-3 hover:scale-105">
                <Download size={18} className="group-hover:translate-y-0.5 transition" /> {settings.cv_label}
              </a>
            </div>
            <div className="reveal mt-8 flex flex-wrap gap-6 text-accent/90" style={revealDelayStyle(5)}>
              {showCvNotice && <p className="w-full text-sm text-accent">My CV will be available here soon.</p>}
              {settings.hero_links.filter((link) => link.url).map((link) => {
                const iconLinkClass = 'hover:-translate-y-1.5 hover:scale-110 hover:text-accent hover:drop-shadow-[0_0_10px_rgb(var(--accent))] transition';
                return link.url.startsWith('#')
                  ? <button key={link.label} onClick={() => goToPage(link.url.slice(1))} aria-label={link.label} title={link.label} className={iconLinkClass}><Icon name={link.icon} size={30} /></button>
                  : <a key={link.label} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label} className={iconLinkClass}><Icon name={link.icon} size={30} /></a>;
              })}
            </div>
          </div>
          <div className="reveal" style={revealDelayStyle(3)}><DevCard name={settings.code_name} role={settings.role} passion={settings.code_passion} location={settings.code_location} footer={settings.code_footer} /></div>
        </div>

        {/* ABOUT + FEATURED */}
        <div className="mt-6 lg:mt-10 grid lg:grid-cols-[1fr_1.15fr] gap-6">
          <TiltCard revealDelay={5} maxTilt={3} className="p-6 sm:p-7 h-full">
            <h3 className="flex items-center gap-3 text-xl font-medium"><span className="w-3.5 h-3.5 rounded bg-accent shadow-[0_0_12px_rgb(var(--accent))]" />About <span className="text-accent -ml-2">Me</span></h3>
            <p className="mt-5 text-sm leading-7 text-fg/85">{settings.about_text}</p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-xs">
              {settings.facts.map((fact) => (
                <div key={fact.title} className="group flex items-center gap-3"><Icon name={fact.icon} size={26} className="text-accent group-hover:scale-125 transition" /><div>{fact.title}<br /><span className="text-mute">{fact.sub}</span></div></div>
              ))}
            </div>
          </TiltCard>

          <TiltCard revealDelay={6} maxTilt={2} className="p-5 sm:p-6 h-full">
            <div className="flex justify-between items-center">
              <h3 className="flex items-center gap-3 text-xl font-medium"><span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />Featured Projects</h3>
              <button onClick={() => goToPage('projects')} className="group text-sm text-accent flex items-center gap-2">View All <ArrowRight size={14} className="group-hover:translate-x-1 transition" /></button>
            </div>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {projectsToShow.map((project) => (
                <TiltCard key={project.id} maxTilt={14} className="!rounded-xl overflow-hidden cursor-pointer group" onClick={() => goToPage('projects')}>
                  <div className="relative h-48 md:h-36 lg:h-24 bg-gradient-to-br from-accent/25 to-transparent flex items-center px-5 overflow-hidden">
                    {project.image_url ? <img src={mediaUrl(project.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-700" /> : <Icon name={project.icon} size={34} className="text-accent group-hover:scale-125 group-hover:-rotate-6 transition duration-500" />}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between"><span className="font-medium text-sm">{project.title}</span><span className="w-6 h-6 rounded-full border border-accent/40 grid place-items-center group-hover:bg-accent group-hover:text-black transition"><ArrowRight size={12} /></span></div>
                    <div className="text-xs text-mute mt-1">{project.subtitle}</div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </TiltCard>
        </div>

        {/* SKILLS — slow infinite marquee */}
        <h3 className="reveal mt-8 flex items-center gap-3 text-xl font-medium" style={revealDelayStyle(7)}><span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />My Skills</h3>
        <div className="reveal marquee-wrap marquee-mask mt-5 mb-6 -mx-5 sm:-mx-8 lg:-mx-12 xl:-mx-16 overflow-hidden py-2" style={revealDelayStyle(8)}>
          <div className="marquee" style={{ '--dur': `${Math.max(30, skills.length * 4)}s` } as React.CSSProperties}>
            {[...skills, ...skills].map((skill, position) => (
              <span key={position} className="shrink-0 mr-3 flex items-center gap-2.5 pl-2 pr-5 py-1.5 text-xs rounded-full border border-accent/25 bg-card/70 hover:border-accent hover:-translate-y-1 hover:shadow-[0_0_20px_rgb(var(--accent)/.35)] transition cursor-default">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent grid place-items-center text-[10px] font-bold">{skill.name.slice(0, 2)}</span>{skill.name}
              </span>
            ))}
          </div>
        </div>
      </ScrollPage>
      <ScrollHint />
    </>
  );
}
