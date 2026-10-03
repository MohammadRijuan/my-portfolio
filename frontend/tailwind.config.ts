import type { Config } from 'tailwindcss';
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { bg: c('bg'), card: c('card'), fg: c('fg'), mute: c('mute'), accent: c('accent'), accent2: c('accent2') },
    fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'], mono: ['var(--font-mono)', 'monospace'] },
  } },
  plugins: [],
} satisfies Config;
