'use client';
import { ArrowUpRight, Briefcase, MapPin } from 'lucide-react';
import ScrollPage from '../ScrollPage';
import TiltCard from '../TiltCard';
import { useData } from '../DataProvider';
import { img } from '@/lib/data';
import { dl } from '@/lib/ui';

const toDate = (d: string) => { const [y, m] = d.split('-'); return new Date(+y, (+m || 1) - 1, 1); };
const fmt = (d: string) => (d ? toDate(d).toLocaleString('en', { month: 'short', year: 'numeric' }) : '');
function duration(start: string, end: string, current: boolean) {
  if (!start) return '';
  const a = toDate(start), b = current || !end ? new Date() : toDate(end);
  const mo = Math.max(1, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1);
  const y = Math.floor(mo / 12), m = mo % 12;
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ');
}

export default function Experience() {
  const { experiences } = useData();
  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={dl(0)}>Work <span className="text-accent text-glow">Experience</span></h2>
      {experiences.length === 0 && (
        <TiltCard d={1} className="mt-8 p-10 text-center text-mute" max={2}><Briefcase className="mx-auto mb-3 text-accent" size={34} />My journey is being written — experience coming soon.</TiltCard>
      )}
      <div className="relative mt-8">
        {experiences.length > 1 && <span className="hidden sm:block absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-accent/60 via-accent/20 to-transparent" />}
        {experiences.map((e, k) => (
          <div key={e.id} className="relative sm:pl-16 mb-8">
            <span className="hidden sm:grid absolute left-[18px] top-8 w-5 h-5 rounded-full border-2 border-accent bg-bg place-items-center">
              {e.current && <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />}
            </span>
            <TiltCard d={1} data-step className="group p-5 sm:p-7 min-h-[34vh]" max={3}>
              <div className="flex gap-4 sm:gap-5 items-start">
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-accent/30 bg-white/[.04] overflow-hidden grid place-items-center group-hover:scale-105 group-hover:border-accent transition">
                  {e.logo_url ? <img src={img(e.logo_url)} alt={e.company} className="w-full h-full object-contain p-1.5" /> : <span className="text-xl font-bold text-accent">{e.company.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-xl sm:text-2xl font-semibold">{e.role}</h3>
                    {e.current && <span className="chip !text-accent">● Present</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-accent">
                    {e.url ? <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">{e.company}<ArrowUpRight size={14} /></a> : e.company}
                    {e.emp_type && <span className="text-mute text-sm">· {e.emp_type}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mute">
                    {e.start_date && <span>{fmt(e.start_date)} — {e.current ? 'Present' : fmt(e.end_date) || 'Present'} · {duration(e.start_date, e.end_date, e.current)}</span>}
                    {(e.location || e.work_mode) && <span className="inline-flex items-center gap-1"><MapPin size={12} />{[e.location, e.work_mode].filter(Boolean).join(' · ')}</span>}
                  </div>
                </div>
              </div>
              {e.description && (
                <ul className="mt-5 space-y-2 text-sm leading-6 text-fg/85">
                  {e.description.split('\n').filter((l) => l.trim()).map((l, i) => (
                    <li key={i} className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-accent" />{l.replace(/^[-•*]\s*/, '')}</li>
                  ))}
                </ul>
              )}
              {e.tech.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{e.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>}
            </TiltCard>
          </div>
        ))}
      </div>
    </ScrollPage>
  );
}
