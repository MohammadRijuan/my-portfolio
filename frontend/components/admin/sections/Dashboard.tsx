import { Mail, Plus, SlidersHorizontal } from 'lucide-react';
import { Panel } from '../fields';
import { ghostButtonClass, primaryButtonClass } from '../styles';
import { emptyProjectForm, Section, Stats } from '../types';

export default function Dashboard({ stats, goTo, newProject }: { stats: Stats | null; goTo: (section: Section) => void; newProject: (form: any) => void }) {
  const cards = [['Projects', stats?.projects], ['Skills', stats?.skills], ['Experience', stats?.experiences], ['Messages', stats?.messages], ['Unread', stats?.unread]];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(([label, value]) => (
          <div key={label as string} className="glass p-5"><div className="text-3xl font-bold text-accent">{value ?? '–'}</div><div className="text-xs text-mute mt-1">{label}</div></div>
        ))}
      </div>
      <Panel title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <button className={primaryButtonClass} onClick={() => goTo('settings')}><SlidersHorizontal size={15} /> Edit site content</button>
          <button className={ghostButtonClass} onClick={() => { goTo('projects'); newProject({ ...emptyProjectForm }); }}><Plus size={15} /> New project</button>
          <button className={ghostButtonClass} onClick={() => goTo('messages')}><Mail size={15} /> Read messages</button>
        </div>
      </Panel>
    </div>
  );
}
