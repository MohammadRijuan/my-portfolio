'use client';
/**
 * /skills — the Skills page.
 *
 * All of this page's code lives in this file (layout, text, small helpers).
 * Shared building blocks are imported from @/components, data from @/lib.
 * The URL /skills comes from this folder name; the 3D slide between pages is done by <SiteShell> (see components/SiteShell.tsx).
 */
import ScrollPage from '@/components/ScrollPage';
import TiltCard from '@/components/TiltCard';
import { useData } from '@/components/DataProvider';
import { revealDelayStyle } from '@/lib/ui';

export default function Skills() {
  const { skills } = useData();
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));
  return (
    <ScrollPage>
      <h2 className="reveal text-4xl font-bold" style={revealDelayStyle(0)}>My <span className="text-accent text-glow">Skills</span></h2>
      {categories.map((category) => (
        <TiltCard key={category} revealDelay={1} data-step className="mt-8 p-6 sm:p-8 min-h-[38vh]" maxTilt={3}>
          <h3 className="text-xl font-medium text-accent">{category}</h3>
          <div className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-5">
            {skills.filter((skill) => skill.category === category).map((skill) => (
              <div key={skill.id} className="group">
                <div className="flex justify-between text-sm mb-2"><span className="group-hover:text-accent transition">{skill.name}</span><span className="text-mute">{skill.level}%</span></div>
                <div className="h-2 rounded-full bg-accent/15 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 shadow-[0_0_12px_rgb(var(--accent))] group-hover:brightness-125 transition" style={{ width: `${skill.level}%` }} /></div>
              </div>
            ))}
          </div>
        </TiltCard>
      ))}
    </ScrollPage>
  );
}
