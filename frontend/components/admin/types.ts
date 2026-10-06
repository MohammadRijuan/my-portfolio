import { LayoutDashboard, SlidersHorizontal, FolderKanban, Sparkles, Mail, Briefcase, Palette } from 'lucide-react';

export type ContactMessage = { id: number; name: string; email: string; message: string; read: boolean; notified: boolean; created_at: string };
export type Stats = { projects: number; skills: number; experiences: number; messages: number; unread: number };
export type Section = 'dashboard' | 'settings' | 'theme' | 'projects' | 'skills' | 'experience' | 'messages';
export type Toast = { id: number; message: string; type: 'ok' | 'err' };

export const ADMIN_NAV_ITEMS: [Section, string, typeof Mail][] = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['settings', 'Site content', SlidersHorizontal],
  ['theme', 'Theme', Palette],
  ['projects', 'Projects', FolderKanban],
  ['skills', 'Skills', Sparkles],
  ['experience', 'Experience', Briefcase],
  ['messages', 'Messages', Mail],
];

export const emptyProjectForm = { title: '', subtitle: '', description: '', tags: '', live_url: '', repo_url: '', image_url: '', icon: 'code', featured: true };
export const emptySkillForm = { name: '', level: 80, category: 'Languages' };
export const emptyExperienceForm = {
  company: '', logo_url: '', role: '', emp_type: 'Full-time', location: '', work_mode: 'On-site',
  start_date: '', end_date: '', current: false, description: '', tech: '', url: '',
};
