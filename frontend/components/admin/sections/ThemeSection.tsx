import { Save } from 'lucide-react';
import { THEMES, BRANDS, rgbToHex } from '@/lib/theme';
import { Panel, Select } from '../fields';
import { ghostButtonClass, primaryButtonClass } from '../styles';
import type { Admin } from '../useAdmin';

export default function ThemeSection({ admin }: { admin: Admin }) {
  const { settings, updateSetting, setSettings } = admin;
  return (
    <div className="space-y-6">
      <div className="sticky top-3 z-20 flex justify-end gap-3">
        <button className={ghostButtonClass} onClick={admin.resetTheme}>Reset to default</button>
        <button className={primaryButtonClass} onClick={admin.saveSettings}><Save size={15} /> Save theme</button>
      </div>

      <Panel title="Theme — background & surfaces">
        <p className="text-xs text-mute mb-4">Changes preview live on this page. Dark and light modes both follow the chosen theme.</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((theme) => (
            <button key={theme.id} onClick={() => updateSetting('theme_preset', theme.id)}
              className={`text-left rounded-2xl p-3 border transition hover:-translate-y-1 ${settings.theme_preset === theme.id ? 'border-accent shadow-[0_0_25px_rgb(var(--accent)/.35)]' : 'border-accent/15'}`}>
              <div className="rounded-xl p-2.5 h-24" style={{ background: `rgb(${theme.dark.bg})` }}>
                <div className="h-full rounded-lg p-2 flex flex-col gap-1.5" style={{ background: `rgb(${theme.dark.card})` }}>
                  <span className="h-2 w-2/3 rounded" style={{ background: `rgb(${theme.dark.fg})` }} />
                  <span className="h-1.5 w-1/2 rounded" style={{ background: `rgb(${theme.dark.mute})` }} />
                  <span className="mt-auto h-3 w-10 rounded-full bg-accent" />
                </div>
              </div>
              <div className="mt-2 text-sm">{theme.name}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Brand colors">
        <div className="flex flex-wrap gap-4">
          {BRANDS.map((brand) => (
            <button key={brand.id} onClick={() => updateSetting('brand_preset', brand.id)} className="group text-center w-24">
              <span className={`block mx-auto w-14 h-14 rounded-full border-2 transition group-hover:scale-110 ${settings.brand_preset === brand.id ? 'border-fg scale-110 shadow-[0_0_25px_rgb(var(--accent)/.5)]' : 'border-transparent'}`}
                style={{ background: `linear-gradient(135deg, rgb(${brand.primary}), rgb(${brand.secondary}))` }} />
              <span className="block mt-2 text-xs text-mute">{brand.name}</span>
            </button>
          ))}
          <button className="group text-center w-24"
            onClick={() => setSettings((previous) => {
              const currentBrand = BRANDS.find((candidate) => candidate.id === previous.brand_preset);
              return { ...previous, brand_preset: 'custom', ...(currentBrand ? { brand_a: rgbToHex(currentBrand.primary), brand_b: rgbToHex(currentBrand.secondary) } : {}) };
            })}>
            <span className={`block mx-auto w-14 h-14 rounded-full border-2 transition group-hover:scale-110 ${settings.brand_preset === 'custom' ? 'border-fg scale-110' : 'border-transparent'}`}
              style={{ background: 'conic-gradient(#f43f5e,#f59e0b,#22c55e,#06b6d4,#6366f1,#d946ef,#f43f5e)' }} />
            <span className="block mt-2 text-xs text-mute">Custom</span>
          </button>
        </div>
        {settings.brand_preset === 'custom' && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {([['brand_a', 'Primary color'], ['brand_b', 'Secondary color']] as const).map(([colorKey, label]) => (
              <label key={colorKey} className="block">
                <span className="text-xs text-mute mb-1.5 block">{label}</span>
                <input type="color" value={settings[colorKey]} onChange={(event) => updateSetting(colorKey, event.target.value)} className="w-full h-12 rounded-xl bg-transparent border border-accent/20 cursor-pointer" />
              </label>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Default mode for new visitors">
        <Select label="Visitors can still switch with the Dark / Light button" value={settings.default_mode} options={['dark', 'light']} onChange={(value) => updateSetting('default_mode', value)} />
      </Panel>
    </div>
  );
}
