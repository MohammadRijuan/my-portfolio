const dns = require('dns').promises;

const DISPOSABLE = new Set(['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'throwawaymail.com', 'dispostable.com', 'maildrop.cc', 'temp-mail.org', 'fakeinbox.com']);
const NOT_FOUND = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN']);
const timeout = (p, ms = 3000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);

/** True when the address' domain can receive mail (MX or A record) and isn't a throwaway provider.
 *  DNS hiccups fail open so real visitors are never blocked by a network glitch. */
async function emailExists(email) {
  const domain = email.split('@')[1].toLowerCase();
  if (DISPOSABLE.has(domain)) return false;
  try { if ((await timeout(dns.resolveMx(domain))).length) return true; }
  catch (e) { if (!NOT_FOUND.has(e.code)) return true; }
  try { return (await timeout(dns.resolve4(domain))).length > 0; }
  catch (e) { return !NOT_FOUND.has(e.code); }
}
module.exports = { emailExists };
