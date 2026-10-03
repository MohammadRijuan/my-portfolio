'use client';
import ScrollPage from '../ScrollPage';
import TiltCard from '../TiltCard';
import { useData } from '../DataProvider';
import { dl } from '@/lib/ui';

export default function Skills() {
  const { skills } = useData();
  const cats = Array.from(new Set(skills.map((s) => s.category)));
  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={dl(0)}>My <span className="text-accent text-glow">Skills</span></h2>
      {cats.map((c) => (
        <TiltCard key={c} d={1} data-step className="mt-8 p-6 sm:p-8 min-h-[38vh]" max={3}>
          <h3 className="text-xl font-medium text-accent">{c}</h3>
          <div className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-5">
            {skills.filter((s) => s.category === c).map((s) => (
              <div key={s.id} className="group">
                <div className="flex justify-between text-sm mb-2"><span className="group-hover:text-accent transition">{s.name}</span><span className="text-mute">{s.level}%</span></div>
                <div className="h-2 rounded-full bg-accent/15 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 shadow-[0_0_12px_rgb(var(--accent))] group-hover:brightness-125 transition" style={{ width: `${s.level}%` }} /></div>
              </div>
            ))}
          </div>
        </TiltCard>
      ))}
    </ScrollPage>
  );
}
