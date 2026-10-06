'use client';
/**
 * /experience — the Experience page.
 *
 * All of this page's code lives in this file (layout, text, small helpers).
 * Shared building blocks are imported from @/components, data from @/lib.
 * The URL /experience comes from this folder name; the 3D slide between pages is done by <SiteShell> (see components/SiteShell.tsx).
 */
import { ArrowUpRight, Briefcase, MapPin } from 'lucide-react';
import ScrollPage from '@/components/ScrollPage';
import TiltCard from '@/components/TiltCard';
import { useData } from '@/components/DataProvider';
import { mediaUrl } from '@/lib/data';
import { revealDelayStyle } from '@/lib/ui';

const parseYearMonth = (yearMonth: string) => { const [year, month] = yearMonth.split('-'); return new Date(+year, (+month || 1) - 1, 1); };
const formatMonthYear = (yearMonth: string) => (yearMonth ? parseYearMonth(yearMonth).toLocaleString('en', { month: 'short', year: 'numeric' }) : '');
function formatDuration(start: string, end: string, current: boolean) {
  if (!start) return '';
  const startDate = parseYearMonth(start), endDate = current || !end ? new Date() : parseYearMonth(end);
  const totalMonths = Math.max(1, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1);
  const years = Math.floor(totalMonths / 12), remainingMonths = totalMonths % 12;
  return [years && `${years} yr${years > 1 ? 's' : ''}`, remainingMonths && `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}

export default function Experience() {
  const { experiences } = useData();
  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={revealDelayStyle(0)}>Work <span className="text-accent text-glow">Experience</span></h2>
      {experiences.length === 0 && (
        <TiltCard revealDelay={1} className="mt-8 p-10 text-center text-mute" maxTilt={2}><Briefcase className="mx-auto mb-3 text-accent" size={34} />My journey is being written — experience coming soon.</TiltCard>
      )}
      <div className="relative mt-8">
        {experiences.length > 1 && <span className="hidden sm:block absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-accent/60 via-accent/20 to-transparent" />}
        {experiences.map((experience, index) => (
          <div key={experience.id} className="relative sm:pl-16 mb-8">
            <span className="hidden sm:grid absolute left-[18px] top-8 w-5 h-5 rounded-full border-2 border-accent bg-bg place-items-center">
              {experience.current && <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />}
            </span>
            <TiltCard revealDelay={1} data-step className="group p-5 sm:p-7 min-h-[34vh]" maxTilt={3}>
              <div className="flex gap-4 sm:gap-5 items-start">
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-accent/30 bg-white/[.04] overflow-hidden grid place-items-center group-hover:scale-105 group-hover:border-accent transition">
                  {experience.logo_url ? <img src={mediaUrl(experience.logo_url)} alt={experience.company} className="w-full h-full object-contain p-1.5" /> : <span className="text-xl font-bold text-accent">{experience.company.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-xl sm:text-2xl font-semibold">{experience.role}</h3>
                    {experience.current && <span className="chip !text-accent">● Present</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-accent">
                    {experience.url ? <a href={experience.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">{experience.company}<ArrowUpRight size={14} /></a> : experience.company}
                    {experience.emp_type && <span className="text-mute text-sm">· {experience.emp_type}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mute">
                    {experience.start_date && <span>{formatMonthYear(experience.start_date)} — {experience.current ? 'Present' : formatMonthYear(experience.end_date) || 'Present'} · {formatDuration(experience.start_date, experience.end_date, experience.current)}</span>}
                    {(experience.location || experience.work_mode) && <span className="inline-flex items-center gap-1"><MapPin size={12} />{[experience.location, experience.work_mode].filter(Boolean).join(' · ')}</span>}
                  </div>
                </div>
              </div>
              {experience.description && (
                <ul className="mt-5 space-y-2 text-sm leading-6 text-fg/85">
                  {experience.description.split('\n').filter((line) => line.trim()).map((line, lineIndex) => (
                    <li key={lineIndex} className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-accent" />{line.replace(/^[-•*]\s*/, '')}</li>
                  ))}
                </ul>
              )}
              {experience.tech.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{experience.tech.map((techName) => <span key={techName} className="chip">{techName}</span>)}</div>}
            </TiltCard>
          </div>
        ))}
      </div>
    </ScrollPage>
  );
}
