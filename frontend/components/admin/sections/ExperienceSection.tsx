import { Briefcase, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { mediaUrl } from '@/lib/data';
import { Field, Panel, Select } from '../fields';
import ImageDrop from '../ImageDrop';
import { ghostButtonClass, primaryButtonClass } from '../styles';
import { emptyExperienceForm } from '../types';
import type { Admin } from '../useAdmin';

export default function ExperienceSection({ admin }: { admin: Admin }) {
  const { experienceForm, setExperienceForm, experiences } = admin;
  return (
    <div className="space-y-4">
      {experienceForm ? (
        <Panel title={experienceForm.id ? 'Edit experience' : 'New experience'} right={<button onClick={() => setExperienceForm(null)} aria-label="Close"><X size={18} /></button>}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company name" value={experienceForm.company} onChange={(value) => setExperienceForm({ ...experienceForm, company: value })} />
            <Field label="Designation / role" value={experienceForm.role} onChange={(value) => setExperienceForm({ ...experienceForm, role: value })} />
            <Select label="Employment type" value={experienceForm.emp_type} options={['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract']} onChange={(value) => setExperienceForm({ ...experienceForm, emp_type: value })} />
            <Select label="Work mode" value={experienceForm.work_mode} options={['On-site', 'Remote', 'Hybrid']} onChange={(value) => setExperienceForm({ ...experienceForm, work_mode: value })} />
            <Field label="Location" value={experienceForm.location} onChange={(value) => setExperienceForm({ ...experienceForm, location: value })} />
            <Field label="Company website" value={experienceForm.url} onChange={(value) => setExperienceForm({ ...experienceForm, url: value })} />
            <Field label="Start month" type="month" value={experienceForm.start_date} onChange={(value) => setExperienceForm({ ...experienceForm, start_date: value })} />
            {experienceForm.current ? <div /> : <Field label="End month" type="month" value={experienceForm.end_date} onChange={(value) => setExperienceForm({ ...experienceForm, end_date: value })} />}
            <label className="flex items-center gap-3 text-sm sm:col-span-2">
              <input type="checkbox" className="accent-[rgb(var(--accent))] w-4 h-4" checked={experienceForm.current} onChange={(event) => setExperienceForm({ ...experienceForm, current: event.target.checked })} /> I currently work here (shows “Present”)
            </label>
            <div className="sm:col-span-2"><ImageDrop label="Company logo" value={experienceForm.logo_url} onChange={(value) => setExperienceForm({ ...experienceForm, logo_url: value })} /></div>
            <div className="sm:col-span-2"><Field label="Responsibilities & achievements (one per line)" multiline value={experienceForm.description} onChange={(value) => setExperienceForm({ ...experienceForm, description: value })} /></div>
            <div className="sm:col-span-2"><Field label="Tech stack used (comma separated)" value={Array.isArray(experienceForm.tech) ? experienceForm.tech.join(', ') : experienceForm.tech} onChange={(value) => setExperienceForm({ ...experienceForm, tech: value })} /></div>
          </div>
          <div className="mt-5 flex gap-3">
            <button className={primaryButtonClass} onClick={admin.saveExperience} disabled={!experienceForm.company || !experienceForm.role}><Save size={15} /> Save</button>
            <button className={ghostButtonClass} onClick={() => setExperienceForm(null)}>Cancel</button>
          </div>
        </Panel>
      ) : <button className={primaryButtonClass} onClick={() => setExperienceForm({ ...emptyExperienceForm })}><Plus size={15} /> New experience</button>}

      {experiences.map((experience) => (
        <div key={experience.id} className="glass p-4 flex items-center gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl border border-accent/25 overflow-hidden grid place-items-center bg-white/5">
            {experience.logo_url ? <img src={mediaUrl(experience.logo_url)} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={18} className="text-accent" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{experience.role} {experience.current && <span className="chip ml-2">present</span>}</div>
            <div className="text-xs text-mute truncate">{experience.company} · {experience.start_date || '—'} → {experience.current ? 'Present' : experience.end_date || '—'}</div>
          </div>
          <button className={ghostButtonClass} onClick={() => setExperienceForm({ ...experience })}><Pencil size={14} /></button>
          <button className={`${ghostButtonClass} !text-red-400`} onClick={() => admin.deleteItem('experiences', experience.id)}><Trash2 size={14} /></button>
        </div>
      ))}
      {experiences.length === 0 && !experienceForm && <p className="text-mute">No experience added yet.</p>}
    </div>
  );
}
