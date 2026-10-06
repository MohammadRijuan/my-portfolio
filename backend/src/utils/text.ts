/** "a, b" or ['a','b'] -> ['a','b'] (trimmed, empty items removed). */
export const splitIntoList = (value: unknown): string[] =>
  (Array.isArray(value) ? value : String(value || '').split(',')).map((item) => String(item).trim()).filter(Boolean);

/** Any value -> string, cut to `max` characters. */
export const limitText = (value: unknown, max = 2000): string => String(value ?? '').slice(0, max);
