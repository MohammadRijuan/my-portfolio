import defaults from './defaults.json';

export type Settings = Omit<typeof defaults.settings, 'certifications'> & { certifications: { title: string; image: string }[] };
export type Project = { id: number; title: string; subtitle: string; description: string; tags: string[]; live_url: string; repo_url: string; image_url: string; icon: string; featured: boolean };
export type Experience = { id: number; company: string; logo_url: string; role: string; emp_type: string; location: string; work_mode: string; start_date: string; end_date: string; current: boolean; description: string; tech: string[]; url: string };
export type Skill = { id: number; name: string; level: number; category: string };

export const API = (process.env.NEXT_PUBLIC_API_URL || 'https://rijuan-server.vercel.app').replace(/\/+$/, '');
export const defaultSettings: Settings = defaults.settings;
export const fallbackProjects: Project[] = defaults.projects.map((p, i) => ({ ...p, id: i + 1 }));
export const fallbackSkills: Skill[] = defaults.skills.map((s, i) => ({ ...s, id: i + 1 }));

/** Uploaded images are stored as relative /api/media/ID paths; this resolves them against the API. */
export const img = (u: string) => (u && u.startsWith('/api/') ? API + u : u || '');
/** Link that makes the browser download an uploaded file directly (served with Content-Disposition: attachment). */
export const dlUrl = (u: string) => (!u ? '#' : u.startsWith('/api/') ? `${API}${u}?download=1` : u);
