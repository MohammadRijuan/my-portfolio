import crypto from 'crypto';

/** Constant-time string comparison (used for the admin access code). */
export const safeCompare = (actual: string, expected: string): boolean => {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && crypto.timingSafeEqual(actualBytes, expectedBytes);
};
