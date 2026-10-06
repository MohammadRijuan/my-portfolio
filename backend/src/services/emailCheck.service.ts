import { promises as dns } from 'dns';

const DISPOSABLE = new Set(['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'throwawaymail.com', 'dispostable.com', 'maildrop.cc', 'temp-mail.org', 'fakeinbox.com']);
const NOT_FOUND = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN']);

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), timeoutMs)),
  ]);

/**
 * True when the address' domain can receive mail (MX or A record) and isn't a throwaway provider.
 * DNS hiccups fail open so real visitors are never blocked by a network glitch.
 * (Not used by the current contact form.)
 */
export async function emailExists(email: string): Promise<boolean> {
  const domain = email.split('@')[1].toLowerCase();
  if (DISPOSABLE.has(domain)) return false;
  try { if ((await withTimeout(dns.resolveMx(domain))).length) return true; }
  catch (error) { if (!NOT_FOUND.has((error as NodeJS.ErrnoException).code as string)) return true; }
  try { return (await withTimeout(dns.resolve4(domain))).length > 0; }
  catch (error) { return !NOT_FOUND.has((error as NodeJS.ErrnoException).code as string); }
}
