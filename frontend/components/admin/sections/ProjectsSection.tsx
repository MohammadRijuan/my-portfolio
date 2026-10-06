import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { icons } from '@/components/Icon';
import { Field, Panel, Select } from '../fields';
import ImageDrop from '../ImageDrop';
import { ghostButtonClass, primaryButtonClass } from '../styles';
import { emptyProjectForm } from '../types';
import type { Admin } from '../useAdmin';

export default function ProjectsSection({ admin }: { admin: Admin }) {
  const { projectForm, setProjectForm, projects } = admin;
  return (
    <div className="space-y-4">
      {projectForm ? (
        <Panel title={projectForm.id ? 'Edit project' : 'New project'} right={<button onClick={() => setProjectForm(null)} aria-label="Close"><X size={18} /></button>}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title" value={projectForm.title} onChange={(value) => setProjectForm({ ...projectForm, title: value })} />
            <Field label="Subtitle" value={projectForm.subtitle} onChange={(value) => setProjectForm({ ...projectForm, subtitle: value })} />
            <Field label="Live URL" value={projectForm.live_url} onChange={(value) => setProjectForm({ ...projectForm, live_url: value })} />
            <Field label="Repository URL" value={projectForm.repo_url} onChange={(value) => setProjectForm({ ...projectForm, repo_url: value })} />
            <div className="sm:col-span-2"><ImageDrop label="Project image (optional)" value={projectForm.image_url} onChange={(value) => setProjectForm({ ...projectForm, image_url: value })} /></div>
            <Field label="Tags (comma separated)" value={Array.isArray(projectForm.tags) ? projectForm.tags.join(', ') : projectForm.tags} onChange={(value) => setProjectForm({ ...projectForm, tags: value })} />
            <Select label="Icon" value={projectForm.icon} options={Object.keys(icons)} onChange={(value) => setProjectForm({ ...projectForm, icon: value })} />
            <label className="flex items-center gap-3 text-sm mt-6">
              <input type="checkbox" className="accent-[rgb(var(--accent))] w-4 h-4" checked={projectForm.featured} onChange={(event) => setProjectForm({ ...projectForm, featured: event.target.checked })} /> Show on homepage
            </label>
          </div>
          <div className="mt-4"><Field label="Description" multiline value={projectForm.description} onChange={(value) => setProjectForm({ ...projectForm, description: value })} /></div>
          <div className="mt-5 flex gap-3">
            <button className={primaryButtonClass} onClick={admin.saveProject} disabled={!projectForm.title}><Save size={15} /> Save</button>
            <button className={ghostButtonClass} onClick={() => setProjectForm(null)}>Cancel</button>
          </div>
        </Panel>
      ) : <button className={primaryButtonClass} onClick={() => setProjectForm({ ...emptyProjectForm })}><Plus size={15} /> New project</button>}

      {projects.map((project, index) => (
        <div key={project.id} className="glass p-4 flex items-center gap-3">
          <div className="flex flex-col">
            <button onClick={() => admin.moveProject(index, -1)} className="hover:text-accent" aria-label="Up"><ArrowUp size={15} /></button>
            <button onClick={() => admin.moveProject(index, 1)} className="hover:text-accent" aria-label="Down"><ArrowDown size={15} /></button>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{project.title} {project.featured && <span className="chip ml-2">home</span>}</div>
            <div className="text-xs text-mute truncate">{project.subtitle}</div>
          </div>
          {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="text-mute hover:text-accent"><ExternalLink size={16} /></a>}
          <button className={ghostButtonClass} onClick={() => setProjectForm({ ...project })}><Pencil size={14} /></button>
          <button className={`${ghostButtonClass} !text-red-400`} onClick={() => admin.deleteItem('projects', project.id)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}
