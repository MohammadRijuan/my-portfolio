'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { applyTheme } from '@/lib/theme';
import { SITE_CHANGED_KEY } from '@/lib/siteSync';
import { API_URL, Experience, Project, Settings, Skill, defaultSettings, fallbackProjects, fallbackSkills } from '@/lib/data';

type SiteData = { settings: Settings; projects: Project[]; skills: Skill[]; experiences: Experience[] };

const initialSiteData: SiteData = { settings: defaultSettings, projects: fallbackProjects, skills: fallbackSkills, experiences: [] };
const SiteDataContext = createContext<SiteData>(initialSiteData);
export const useData = () => useContext(SiteDataContext);

/** How often an open page asks the server "has the content changed?" (milliseconds). The answer is tiny and cheap. */
const CONTENT_CHECK_INTERVAL_MS = 5000;

/**
 * Loads the website's content (settings, projects, skills, experiences) and keeps it up to date while the page stays open:
 *  1. loads everything once when the page opens;
 *  2. every few seconds (and when you come back to the tab) asks for the small "content version" code;
 *  3. when that code differs from the one it knows, the content was edited in the CMS, so it downloads the new content
 *     and the page updates by itself, with no reload.
 */
export default function DataProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>(initialSiteData);
  /** The content version of the data currently on screen (null = not known yet). */
  const knownVersion = useRef<string | null>(null);
  const isCmsPage = usePathname().startsWith('/admin');

  /** Downloads the content from `url` and puts it on screen. Resolves to true when it worked. */
  const loadSiteData = useCallback(async (url: string): Promise<boolean> => {
    try {
      const siteResponse = await (await fetch(url)).json();
      if (!siteResponse || !siteResponse.settings) return false;

      const settingsWithDefaults = { ...defaultSettings, ...siteResponse.settings };
      applyTheme(settingsWithDefaults);
      setSiteData({
        settings: settingsWithDefaults,
        projects: siteResponse.projects?.length ? siteResponse.projects : fallbackProjects,
        skills: siteResponse.skills?.length ? siteResponse.skills : fallbackSkills,
        experiences: siteResponse.experiences || [],
      });
      if (typeof siteResponse.version === 'string') knownVersion.current = siteResponse.version;
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Asks the server for the current content version and reloads the content if it changed.
   * `skipSharedCache` adds a throw-away "?t=" so the answer is guaranteed fresh (used right after a CMS change).
   */
  const checkForChanges = useCallback(async (skipSharedCache = false) => {
    try {
      const versionUrl = `${API_URL}/api/site/version${skipSharedCache ? `?t=${Date.now()}` : ''}`;
      const response = await fetch(versionUrl);
      if (!response.ok) return;
      const { version } = await response.json();
      if (typeof version !== 'string' || version === knownVersion.current) return;

      // A new version means a new URL, so the content can never come from an old cached copy.
      const loaded = await loadSiteData(`${API_URL}/api/site?v=${encodeURIComponent(version)}`);
      if (loaded) knownVersion.current = version;
    } catch { /* offline or server busy: try again at the next check */ }
  }, [loadSiteData]);

  // 1. First load. Right afterwards, check once more so a visitor never starts on a copy older than a couple of seconds.
  useEffect(() => {
    loadSiteData(`${API_URL}/api/site`).then(() => checkForChanges());
  }, [loadSiteData, checkForChanges]);

  // 2 + 3. Keep checking while the page is open. (Not on /admin: the CMS has its own live preview of the theme.)
  useEffect(() => {
    if (isCmsPage) return;
    const checkIfTabIsVisible = () => { if (document.visibilityState === 'visible') checkForChanges(); };
    const onStorageChange = (event: StorageEvent) => { if (event.key === SITE_CHANGED_KEY) checkForChanges(true); }; // the CMS (another tab) just saved something

    const timer = setInterval(checkIfTabIsVisible, CONTENT_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', checkIfTabIsVisible); // check right away when you come back to the tab
    window.addEventListener('focus', checkIfTabIsVisible);
    window.addEventListener('storage', onStorageChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', checkIfTabIsVisible);
      window.removeEventListener('focus', checkIfTabIsVisible);
      window.removeEventListener('storage', onStorageChange);
    };
  }, [isCmsPage, checkForChanges]);

  return <SiteDataContext.Provider value={siteData}>{children}</SiteDataContext.Provider>;
}
