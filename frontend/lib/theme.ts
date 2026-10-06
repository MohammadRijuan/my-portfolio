import type { Settings } from './data';

type RGB = [number, number, number];
type Palette = { bg: RGB; card: RGB; fg: RGB; mute: RGB };
export const THEMES: { id: string; name: string; orb: RGB; dark: Palette; light: Palette }[] = [
  { id: 'emerald-night', name: 'Emerald Night (default)', orb: [30, 120, 200], dark: { bg: [3, 12, 11], card: [10, 28, 26], fg: [240, 250, 246], mute: [160, 185, 178] }, light: { bg: [232, 246, 241], card: [255, 255, 255], fg: [9, 30, 26], mute: [70, 100, 92] } },
  { id: 'midnight-blue', name: 'Midnight Blue', orb: [120, 60, 200], dark: { bg: [5, 9, 22], card: [14, 22, 46], fg: [238, 243, 255], mute: [150, 165, 195] }, light: { bg: [235, 241, 252], card: [255, 255, 255], fg: [12, 20, 44], mute: [78, 92, 120] } },
  { id: 'obsidian', name: 'Obsidian', orb: [90, 90, 140], dark: { bg: [8, 8, 10], card: [22, 22, 26], fg: [245, 245, 247], mute: [165, 165, 175] }, light: { bg: [244, 244, 246], card: [255, 255, 255], fg: [20, 20, 24], mute: [100, 100, 110] } },
  { id: 'plum-dusk', name: 'Plum Dusk', orb: [200, 60, 140], dark: { bg: [14, 7, 20], card: [30, 16, 42], fg: [248, 240, 252], mute: [180, 160, 195] }, light: { bg: [247, 238, 250], card: [255, 255, 255], fg: [36, 14, 48], mute: [110, 85, 125] } },
  { id: 'graphite', name: 'Graphite Slate', orb: [60, 110, 160], dark: { bg: [9, 13, 17], card: [20, 28, 36], fg: [238, 244, 248], mute: [150, 168, 182] }, light: { bg: [236, 241, 245], card: [255, 255, 255], fg: [14, 24, 33], mute: [84, 100, 114] } },
  { id: 'warm-ember', name: 'Warm Ember', orb: [200, 120, 40], dark: { bg: [14, 10, 8], card: [32, 24, 18], fg: [252, 246, 238], mute: [190, 170, 150] }, light: { bg: [250, 244, 235], card: [255, 255, 255], fg: [40, 28, 18], mute: [120, 100, 80] } },
];
export const BRANDS: { id: string; name: string; primary: RGB; secondary: RGB; lightPrimary?: RGB; lightSecondary?: RGB }[] = [
  { id: 'emerald', name: 'Emerald (default)', primary: [52, 232, 156], secondary: [20, 184, 166], lightPrimary: [5, 150, 105], lightSecondary: [13, 148, 136] },
  { id: 'aqua', name: 'Aqua', primary: [34, 211, 238], secondary: [59, 130, 246] },
  { id: 'violet', name: 'Violet', primary: [167, 139, 250], secondary: [99, 102, 241] },
  { id: 'rose', name: 'Rose', primary: [251, 113, 133], secondary: [244, 114, 182] },
  { id: 'amber', name: 'Amber Gold', primary: [251, 191, 36], secondary: [245, 158, 11] },
  { id: 'lime', name: 'Lime', primary: [163, 230, 53], secondary: [74, 222, 128] },
  { id: 'sunset', name: 'Sunset', primary: [251, 146, 60], secondary: [248, 113, 113] },
];

const darkenColor = (color: RGB): RGB => color.map((channel) => Math.round(channel * 0.62)) as RGB;
export const hexToRgb = (hex: string): RGB => { const match = /^#?([0-9a-f]{6})$/i.exec(hex || ''); const rgbNumber = match ? parseInt(match[1], 16) : 0x34e89c; return [(rgbNumber >> 16) & 255, (rgbNumber >> 8) & 255, rgbNumber & 255]; };
export const rgbToHex = (color: RGB) => '#' + color.map((channel) => channel.toString(16).padStart(2, '0')).join('');

type ThemeSettings = Pick<Settings, 'theme_preset' | 'brand_preset' | 'brand_a' | 'brand_b'>;
export function themeCss(settings: ThemeSettings): string {
  const theme = THEMES.find((item) => item.id === settings.theme_preset) || THEMES[0];
  const brand = BRANDS.find((item) => item.id === settings.brand_preset);
  const accentColor = brand ? brand.primary : hexToRgb(settings.brand_a), accent2Color = brand ? brand.secondary : hexToRgb(settings.brand_b);
  const cssVariables = (palette: Palette, accent: RGB, accent2: RGB, blob: number) => `--bg:${palette.bg.join(' ')};--card:${palette.card.join(' ')};--fg:${palette.fg.join(' ')};--mute:${palette.mute.join(' ')};--accent:${accent.join(' ')};--accent2:${accent2.join(' ')};--blob:${blob};--orb:${theme.orb.join(' ')}`;
  return `html:root{${cssVariables(theme.dark, accentColor, accent2Color, 0.6)}}html:root.light{${cssVariables(theme.light, brand?.lightPrimary || darkenColor(accentColor), brand?.lightSecondary || darkenColor(accent2Color), 0.28)}}`;
}
/** Injects the theme as CSS variables. persist=false is used for the CMS live preview. */
export function applyTheme(settings: Settings, persist = true) {
  if (typeof document === 'undefined') return;
  const css = themeCss(settings);
  let styleElement = document.getElementById('theme-css');
  if (!styleElement) { styleElement = document.createElement('style'); styleElement.id = 'theme-css'; document.head.appendChild(styleElement); }
  styleElement.textContent = css;
  if (!persist) return;
  try {
    localStorage.setItem('themeCss', css); localStorage.setItem('defaultMode', settings.default_mode);
    if (!localStorage.getItem('theme')) document.documentElement.classList.toggle('light', settings.default_mode === 'light');
  } catch {}
}
