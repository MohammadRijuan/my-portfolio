import type { defaults } from '../../database/defaults';

/** All editable site settings (hero text, about, theme …). Shape comes from database/defaults.json. */
export type Settings = typeof defaults.settings;
