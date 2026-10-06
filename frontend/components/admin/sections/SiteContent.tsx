import { Save } from 'lucide-react';
import { icons } from '@/components/Icon';
import { Field, Panel } from '../fields';
import ImageDrop from '../ImageDrop';
import ListEditor from '../ListEditor';
import { primaryButtonClass } from '../styles';
import type { Admin } from '../useAdmin';

const PAGE_TOGGLES = ['about', 'projects', 'skills', 'experience', 'contact'];
const ICON_OPTIONS = Object.keys(icons);

export default function SiteContent({ admin }: { admin: Admin }) {
  const { settings, updateSetting } = admin;
  return (
    <div className="space-y-6">
      <div className="sticky top-3 z-20 flex justify-end"><button className={primaryButtonClass} onClick={admin.saveSettings}><Save size={15} /> Save changes</button></div>

      <Panel title="Hero">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Logo text" value={settings.logo_text} onChange={(value) => updateSetting('logo_text', value)} />
          <Field label="Greeting badge" value={settings.badge} onChange={(value) => updateSetting('badge', value)} />
          <Field label="Name (white part)" value={settings.name_main} onChange={(value) => updateSetting('name_main', value)} />
          <Field label="Name (green part)" value={settings.name_accent} onChange={(value) => updateSetting('name_accent', value)} />
          <Field label="Role" value={settings.role} onChange={(value) => updateSetting('role', value)} />
          <Field label="Main button label" value={settings.cta_label} onChange={(value) => updateSetting('cta_label', value)} />
          <Field label="CV button label" value={settings.cv_label} onChange={(value) => updateSetting('cv_label', value)} />
        </div>
        <div className="mt-4"><Field label="Tagline" multiline value={settings.tagline} onChange={(value) => updateSetting('tagline', value)} /></div>
        <div className="mt-6">
          <ImageDrop kind="pdf" label="CV (PDF) — drop a file or choose one. The Download CV button downloads it directly (no link to share)." value={settings.cv_url} name={settings.cv_name}
            onChange={(value, fileInfo) => { updateSetting('cv_url', value); updateSetting('cv_name', fileInfo ? fileInfo.name : ''); }} />
        </div>
        <h4 className="text-sm text-mute mt-6 mb-1">Icon links under the intro (empty URL = hidden)</h4>
        <p className="text-xs text-mute mb-3">Use https://… for GitHub / LinkedIn, or #contact (or #projects, #about …) to jump to a page of this site.</p>
        <ListEditor items={settings.hero_links} blank={{ icon: 'globe', label: '', url: '' }} onChange={(newItems) => updateSetting('hero_links', newItems)}
          fields={[{ key: 'icon', label: 'Icon', options: ICON_OPTIONS }, { key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }]} />
      </Panel>

      <Panel title="Pages & SEO">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Browser title (SEO)" value={settings.site_title} onChange={(value) => updateSetting('site_title', value)} />
          <Field label="Meta description (SEO)" value={settings.site_description} onChange={(value) => updateSetting('site_description', value)} />
        </div>
        <h4 className="text-sm text-mute mt-6 mb-3">Show these pages</h4>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {PAGE_TOGGLES.map((pageId) => {
            const isHidden = settings.hidden_pages.split(',').includes(pageId);
            return (
              <label key={pageId} className="flex items-center gap-2 text-sm capitalize">
                <input type="checkbox" className="accent-[rgb(var(--accent))] w-4 h-4" checked={!isHidden}
                  onChange={(event) => {
                    const hiddenPageIds = new Set(settings.hidden_pages.split(',').filter(Boolean));
                    if (event.target.checked) hiddenPageIds.delete(pageId); else hiddenPageIds.add(pageId);
                    updateSetting('hidden_pages', Array.from(hiddenPageIds).join(','));
                  }} />
                {pageId}
              </label>
            );
          })}
        </div>
      </Panel>

      <Panel title="Developer card">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="name" value={settings.code_name} onChange={(value) => updateSetting('code_name', value)} />
          <Field label="passion" value={settings.code_passion} onChange={(value) => updateSetting('code_passion', value)} />
          <Field label="location" value={settings.code_location} onChange={(value) => updateSetting('code_location', value)} />
          <Field label="footer comment" value={settings.code_footer} onChange={(value) => updateSetting('code_footer', value)} />
        </div>
      </Panel>

      <Panel title="About">
        <Field label="About text" multiline value={settings.about_text} onChange={(value) => updateSetting('about_text', value)} />
        <div className="mt-6"><ImageDrop label="Your photo (opens in a lightbox on the About page)" value={settings.profile_image} onChange={(value) => updateSetting('profile_image', value)} /></div>
        <h4 className="text-sm text-mute mt-6 mb-3">Certifications</h4>
        <ListEditor items={settings.certifications} blank={{ title: '', image: '' }} onChange={(newItems) => updateSetting('certifications', newItems)}
          fields={[{ key: 'title', label: 'Title' }, { key: 'image', label: 'Certificate image', image: true }]} />
        <h4 className="text-sm text-mute mt-6 mb-3">Quick facts</h4>
        <ListEditor items={settings.facts} blank={{ icon: 'code', title: '', sub: '' }} onChange={(newItems) => updateSetting('facts', newItems)}
          fields={[{ key: 'icon', label: 'Icon', options: ICON_OPTIONS }, { key: 'title', label: 'Title' }, { key: 'sub', label: 'Subtitle' }]} />
        <h4 className="text-sm text-mute mt-6 mb-3">What I do</h4>
        <ListEditor items={settings.services} blank={{ icon: 'code', title: '', text: '' }} onChange={(newItems) => updateSetting('services', newItems)}
          fields={[{ key: 'icon', label: 'Icon', options: ICON_OPTIONS }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text' }]} />
      </Panel>

      <Panel title="Contact & social">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Gmail address (shown on Contact page)" value={settings.contact_email} onChange={(value) => updateSetting('contact_email', value)} />
          <Field label="WhatsApp number (with country code, e.g. +8801XXXXXXXXX)" value={settings.contact_whatsapp} onChange={(value) => updateSetting('contact_whatsapp', value)} />
          <Field label="Contact text" value={settings.contact_text} onChange={(value) => updateSetting('contact_text', value)} />
        </div>
        <h4 className="text-sm text-mute mt-6 mb-3">Social links (empty URL = hidden)</h4>
        <ListEditor items={settings.socials} blank={{ icon: 'globe', label: '', url: '' }} onChange={(newItems) => updateSetting('socials', newItems)}
          fields={[{ key: 'icon', label: 'Icon', options: ICON_OPTIONS }, { key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }]} />
      </Panel>
    </div>
  );
}
