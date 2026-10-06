'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_URL, Experience, Project, Skill, Settings, defaultSettings } from '@/lib/data';
import { applyTheme } from '@/lib/theme';
import { announceSiteChange } from '@/lib/siteSync';
import type { ContactMessage, Stats, Toast } from './types';

const TOKEN_KEY = 'adm';

/** How often the CMS checks for new contact messages while it is open (milliseconds). */
const MESSAGE_CHECK_INTERVAL_MS = 8000;

/** Kinds of items the CMS can delete (they are also the API paths: DELETE /api/projects/5). */
type DeletableKind = 'projects' | 'skills' | 'experiences' | 'messages';

/**
 * Adds a saved item to a list, or replaces the item with the same id.
 * Used to show a saved item immediately, without waiting for a reload.
 */
const addOrReplaceById = <Item extends { id: number }>(list: Item[], savedItem: Item): Item[] =>
  list.some((item) => item.id === savedItem.id)
    ? list.map((item) => (item.id === savedItem.id ? savedItem : item))
    : [...list, savedItem];

/** Same order the backend uses for the Experience page: current job first, then newest start date. */
const sortExperiences = (experiences: Experience[]): Experience[] =>
  [...experiences].sort(
    (first, second) => Number(second.current) - Number(first.current) || (second.start_date || '').localeCompare(first.start_date || '') || second.id - first.id,
  );

/** All CMS state and actions in one place; the section components only render. */
export function useAdmin() {
  const [token, setToken] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Open edit forms (null = closed).
  const [projectForm, setProjectForm] = useState<any>(null);
  const [skillForm, setSkillForm] = useState<any>(null);
  const [experienceForm, setExperienceForm] = useState<any>(null);

  /**
   * Counts every change made inside the CMS (save, delete, mark read).
   * A background refresh that started before a change is thrown away when it finishes,
   * so an older server answer can never overwrite what you just did.
   */
  const changeCounter = useRef(0);
  /** Ids of the messages already shown, to recognise a NEW message when one arrives. null = not loaded yet. */
  const knownMessageIds = useRef<Set<number> | null>(null);

  useEffect(() => { setToken(sessionStorage.getItem(TOKEN_KEY) || ''); setIsReady(true); }, []);

  /* ----- toasts ----- */
  const showToast = (text: string, type?: 'ok' | 'err') => {
    const toastId = Date.now() + Math.random();
    const toastType = type || (/fail|error|cannot|wrong|unsupported|must|too many/i.test(text) ? 'err' : 'ok');
    setToasts((currentToasts) => [...currentToasts.slice(-3), { id: toastId, message: text, type: toastType }]);
    setTimeout(() => setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId)), 3500);
  };
  const dismissToast = (id: number) => setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));

  const logout = () => { sessionStorage.removeItem(TOKEN_KEY); setToken(''); };

  /* ----- talking to the API ----- */

  /** Authenticated API call. Returns parsed JSON, or null on any failure (401 also logs out). */
  const callApi = useCallback(async (path: string, method = 'GET', body?: unknown) => {
    try {
      const response = await fetch(`${API_URL}/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.status === 401) { logout(); return null; }
      return response.ok ? response.json() : null;
    } catch { return null; }
  }, [token]);

  /**
   * Adds a throw-away "?fresh=<time>" to the URL.
   * The public /api/site answer is cached by Vercel for a short time (so the public website is fast).
   * A unique URL every time makes sure the CMS always gets the real, current data and never that cached copy.
   */
  const withFreshUrl = (path: string) => `${path}${path.includes('?') ? '&' : '?'}fresh=${Date.now()}`;

  /** Loads projects, skills, experiences, settings and messages from the server. */
  const loadAllData = useCallback(async () => {
    const changeCounterAtStart = changeCounter.current;
    const [site, latestMessages] = await Promise.all([callApi(withFreshUrl('/site')), callApi(withFreshUrl('/messages'))]);
    if (changeCounter.current !== changeCounterAtStart) return; // you changed something meanwhile: keep your change
    if (site) {
      setSettings({ ...defaultSettings, ...site.settings });
      setProjects(site.projects); setSkills(site.skills); setExperiences(site.experiences || []);
    }
    if (latestMessages) {
      knownMessageIds.current = new Set(latestMessages.map((message: ContactMessage) => message.id));
      setMessages(latestMessages);
    }
    if (site) setHasLoadedData(true);
  }, [callApi]);
  useEffect(() => { if (token) loadAllData(); }, [token, loadAllData]);

  /* ----- live check for new contact messages ----- */

  /** Fetches the messages again and announces the ones that arrived since the last check. */
  const checkForNewMessages = useCallback(async () => {
    const changeCounterAtStart = changeCounter.current;
    const latestMessages: ContactMessage[] | null = await callApi(withFreshUrl('/messages'));
    if (!latestMessages || changeCounter.current !== changeCounterAtStart) return;

    const alreadyKnownIds = knownMessageIds.current;
    if (alreadyKnownIds) {
      const newMessages = latestMessages.filter((message) => !alreadyKnownIds.has(message.id));
      if (newMessages.length === 1) showToast(`New message from ${newMessages[0].name}`, 'ok');
      else if (newMessages.length > 1) showToast(`${newMessages.length} new messages`, 'ok');
    }
    knownMessageIds.current = new Set(latestMessages.map((message) => message.id));
    setMessages(latestMessages);
  }, [callApi]);

  useEffect(() => {
    if (!token) return;
    const checkIfTabIsVisible = () => { if (document.visibilityState === 'visible') checkForNewMessages(); };
    const timer = setInterval(checkIfTabIsVisible, MESSAGE_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', checkIfTabIsVisible); // check right away when you come back to the tab
    window.addEventListener('focus', checkIfTabIsVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', checkIfTabIsVisible);
      window.removeEventListener('focus', checkIfTabIsVisible);
    };
  }, [token, checkForNewMessages]);

  /* ----- dashboard numbers (always calculated from the lists, so they are never out of date) ----- */
  const stats: Stats | null = useMemo(
    () => hasLoadedData
      ? {
          projects: projects.length,
          skills: skills.length,
          experiences: experiences.length,
          messages: messages.length,
          unread: messages.filter((message) => !message.read).length,
        }
      : null,
    [hasLoadedData, projects, skills, experiences, messages],
  );

  // Browser tab title shows the unread count like a chat app: "(2) …"
  useEffect(() => {
    if (!token || !stats) return;
    const titleWithoutCount = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = stats.unread ? `(${stats.unread}) ${titleWithoutCount}` : titleWithoutCount;
    return () => { document.title = titleWithoutCount; };
  }, [token, stats?.unread]);

  /** Log in with the access code. Resolves to an error message, or null when logged in. */
  const login = async (code: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const loginResult = await response.json();
      if (!response.ok) return loginResult.error || 'Failed';
      sessionStorage.setItem(TOKEN_KEY, loginResult.token);
      setToken(loginResult.token);
      return null;
    } catch { return 'Cannot reach the API'; }
  };

  /* ----- settings & theme ----- */
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((previous) => ({ ...previous, [key]: value }));
  const resetTheme = () => setSettings((previous) => ({ ...previous, theme_preset: 'emerald-night', brand_preset: 'emerald', brand_a: '#34e89c', brand_b: '#14b8a6', default_mode: 'dark' }));
  useEffect(() => { if (token) applyTheme(settings, false); }, [token, settings.theme_preset, settings.brand_preset, settings.brand_a, settings.brand_b]);
  const saveSettings = async () => {
    const result = await callApi('/settings', 'PUT', settings);
    if (result) announceSiteChange();
    showToast(result ? 'Changes saved successfully' : 'Save failed — please try again');
  };

  /* ----- projects / skills / experiences ----- */
  // Pattern for every save: send it to the server -> put the saved item straight into the list
  // (so you see it immediately) -> close the form -> quietly reload in the background to double-check.

  const saveProject = async () => {
    const savedProject: Project | null = projectForm.id
      ? await callApi(`/projects/${projectForm.id}`, 'PUT', projectForm)
      : await callApi('/projects', 'POST', projectForm);
    if (!savedProject) return showToast('Save failed');

    changeCounter.current++;
    announceSiteChange();
    setProjects((current) => addOrReplaceById(current, savedProject));
    setProjectForm(null);
    showToast('Project saved');
    loadAllData();
  };

  const moveProject = async (index: number, direction: number) => {
    const reorderedProjects = [...projects], targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= reorderedProjects.length) return;
    [reorderedProjects[index], reorderedProjects[targetIndex]] = [reorderedProjects[targetIndex], reorderedProjects[index]];
    changeCounter.current++;
    setProjects(reorderedProjects);
    const result = await callApi('/projects/reorder', 'POST', { ids: reorderedProjects.map((project) => project.id) });
    if (result) announceSiteChange();
  };

  const saveSkill = async () => {
    const savedSkill: Skill | null = skillForm.id
      ? await callApi(`/skills/${skillForm.id}`, 'PUT', skillForm)
      : await callApi('/skills', 'POST', skillForm);
    if (!savedSkill) return showToast('Save failed');

    changeCounter.current++;
    announceSiteChange();
    setSkills((current) => addOrReplaceById(current, savedSkill));
    setSkillForm(null);
    showToast('Skill saved');
    loadAllData();
  };

  const saveExperience = async () => {
    const savedExperience: Experience | null = experienceForm.id
      ? await callApi(`/experiences/${experienceForm.id}`, 'PUT', experienceForm)
      : await callApi('/experiences', 'POST', experienceForm);
    if (!savedExperience) return showToast('Save failed');

    changeCounter.current++;
    announceSiteChange();
    setExperiences((current) => sortExperiences(addOrReplaceById(current, savedExperience)));
    setExperienceForm(null);
    showToast('Experience saved');
    loadAllData();
  };

  /** Removes an item from the screen first (instant), then deletes it on the server. If the server refuses, the item comes back. */
  const deleteItem = async (kind: DeletableKind, id: number) => {
    if (!confirm('Delete this item?')) return;

    changeCounter.current++;
    if (kind === 'projects') setProjects((current) => current.filter((project) => project.id !== id));
    if (kind === 'skills') setSkills((current) => current.filter((skill) => skill.id !== id));
    if (kind === 'experiences') setExperiences((current) => current.filter((experience) => experience.id !== id));
    if (kind === 'messages') setMessages((current) => current.filter((message) => message.id !== id));

    const result = await callApi(`/${kind}/${id}`, 'DELETE');
    if (result) {
      if (kind !== 'messages') announceSiteChange(); // messages are private, so the public site has nothing to update
      return showToast('Deleted');
    }

    showToast('Delete failed — please try again');
    loadAllData(); // put the item back on screen
  };

  /** Marks a message read / unread (the unread badge updates instantly). */
  const toggleRead = async (message: ContactMessage) => {
    const nowRead = !message.read;
    changeCounter.current++;
    setMessages((current) => current.map((item) => (item.id === message.id ? { ...item, read: nowRead } : item)));

    const result = await callApi(`/messages/${message.id}`, 'PATCH', { read: nowRead });
    if (!result) { showToast('Update failed — please try again'); loadAllData(); }
  };

  return {
    token, isReady, toasts, showToast, dismissToast, login, logout,
    settings, setSettings, updateSetting, resetTheme, saveSettings,
    projects, projectForm, setProjectForm, saveProject, moveProject,
    skills, skillForm, setSkillForm, saveSkill,
    experiences, experienceForm, setExperienceForm, saveExperience,
    messages, stats, deleteItem, toggleRead,
  };
}

export type Admin = ReturnType<typeof useAdmin>;
