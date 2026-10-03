'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { applyTheme } from '@/lib/theme';
import { API, Experience, Project, Settings, Skill, defaultSettings, fallbackProjects, fallbackSkills } from '@/lib/data';

type Data = { settings: Settings; projects: Project[]; skills: Skill[]; experiences: Experience[] };
const Ctx = createContext<Data>({ settings: defaultSettings, projects: fallbackProjects, skills: fallbackSkills, experiences: [] });
export const useData = () => useContext(Ctx);

export default function DataProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<Data>({ settings: defaultSettings, projects: fallbackProjects, skills: fallbackSkills, experiences: [] });
  useEffect(() => {
    fetch(`${API}/api/site`).then((r) => r.json()).then((x) => {
      if (x && x.settings) { const st = { ...defaultSettings, ...x.settings }; applyTheme(st); setD({ settings: st, projects: x.projects?.length ? x.projects : fallbackProjects, skills: x.skills?.length ? x.skills : fallbackSkills, experiences: x.experiences || [] }); }
    }).catch(() => {});
  }, []);
  return <Ctx.Provider value={d}>{children}</Ctx.Provider>;
}
