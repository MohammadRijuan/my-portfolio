import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Field, Panel } from '../fields';
import { ghostButtonClass, primaryButtonClass } from '../styles';
import { emptySkillForm } from '../types';
import type { Admin } from '../useAdmin';

export default function SkillsSection({ admin }: { admin: Admin }) {
  const { skillForm, setSkillForm, skills } = admin;
  return (
    <div className="space-y-4">
      {skillForm ? (
        <Panel title={skillForm.id ? 'Edit skill' : 'New skill'} right={<button onClick={() => setSkillForm(null)} aria-label="Close"><X size={18} /></button>}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Name" value={skillForm.name} onChange={(value) => setSkillForm({ ...skillForm, name: value })} />
            <Field label="Level (0-100)" type="number" value={skillForm.level} onChange={(value) => setSkillForm({ ...skillForm, level: value })} />
            <Field label="Category" value={skillForm.category} onChange={(value) => setSkillForm({ ...skillForm, category: value })} />
          </div>
          <div className="mt-5 flex gap-3">
            <button className={primaryButtonClass} onClick={admin.saveSkill} disabled={!skillForm.name}><Save size={15} /> Save</button>
            <button className={ghostButtonClass} onClick={() => setSkillForm(null)}>Cancel</button>
          </div>
        </Panel>
      ) : <button className={primaryButtonClass} onClick={() => setSkillForm({ ...emptySkillForm })}><Plus size={15} /> New skill</button>}

      <div className="grid sm:grid-cols-2 gap-3">
        {skills.map((skill) => (
          <div key={skill.id} className="glass p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="truncate">{skill.name} <span className="text-mute text-xs">· {skill.category}</span></div>
              <div className="h-1.5 mt-2 rounded-full bg-accent/15 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${skill.level}%` }} /></div>
            </div>
            <button className={ghostButtonClass} onClick={() => setSkillForm({ ...skill })}><Pencil size={14} /></button>
            <button className={`${ghostButtonClass} !text-red-400`} onClick={() => admin.deleteItem('skills', skill.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
