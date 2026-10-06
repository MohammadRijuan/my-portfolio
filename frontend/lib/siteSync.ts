/**
 * Lets the CMS tell the public website "content just changed" without waiting for the next check.
 * The CMS writes the current time into localStorage; any OTHER tab of the same browser that has the
 * website open hears it instantly (the browser's "storage" event) and reloads its content.
 * Visitors in other browsers get the change through the regular check (see DataProvider.tsx).
 */
export const SITE_CHANGED_KEY = 'siteChangedAt';

/** Call after a successful change in the CMS that visitors can see (project, skill, experience, settings). */
export const announceSiteChange = () => {
  try { localStorage.setItem(SITE_CHANGED_KEY, String(Date.now())); } catch { /* private mode: the regular check still works */ }
};
