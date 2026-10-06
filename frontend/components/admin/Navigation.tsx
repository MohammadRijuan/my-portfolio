import Link from 'next/link';
import { Eye, LogOut } from 'lucide-react';
import { ghostButtonClass } from './styles';
import { ADMIN_NAV_ITEMS, Section, Stats } from './types';

type Props = { section: Section; stats: Stats | null; onSelect: (selectedSection: Section) => void; onLogout: () => void };

/** Desktop sidebar. */
export function Sidebar({ section, stats, onSelect, onLogout }: Props) {
  return (
    <aside className="hidden md:flex sticky top-0 self-start h-screen w-64 shrink-0 flex-col p-5 border-r border-accent/10 bg-bg/40 backdrop-blur-xl">
      <div className="text-lg font-bold mb-8">CMS <span className="text-accent">Studio</span></div>
      <nav className="space-y-1.5 flex-1">
        {ADMIN_NAV_ITEMS.map(([id, label, IconComponent]) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${section === id ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgb(var(--accent)/.3)]' : 'text-fg/75 hover:bg-white/5 hover:translate-x-1'}`}>
            <IconComponent size={17} />{label}
            {id === 'messages' && !!stats?.unread && <span className="ml-auto text-[10px] bg-accent text-black rounded-full px-2 py-0.5">{stats.unread}</span>}
          </button>
        ))}
      </nav>
      <Link href="/" target="_blank" className={`${ghostButtonClass} justify-center`}><Eye size={15} /> View site</Link>
      <button onClick={onLogout} className={`${ghostButtonClass} justify-center mt-2 !text-red-400`}><LogOut size={15} /> Log out</button>
    </aside>
  );
}

/** Mobile bottom bar. */
export function MobileNav({ section, stats, onSelect }: Omit<Props, 'onLogout'>) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around py-2 border-t border-accent/15 bg-bg/80 backdrop-blur-xl">
      {ADMIN_NAV_ITEMS.map(([id, label, IconComponent]) => (
        <button key={id} onClick={() => onSelect(id)} className={`relative flex flex-col items-center gap-1 text-[9px] px-1 ${section === id ? 'text-accent' : 'text-mute'}`}>
          <IconComponent size={19} />{label.split(' ')[0]}
          {id === 'messages' && !!stats?.unread && <span className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-accent" />}
        </button>
      ))}
    </nav>
  );
}

/** Page title + mobile "view site / log out" buttons. */
export function AdminTitle({ section, onLogout }: { section: Section; onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold">{ADMIN_NAV_ITEMS.find((navItem) => navItem[0] === section)![1]}</h1>
      <div className="flex gap-2 md:hidden">
        <Link href="/" className={ghostButtonClass}><Eye size={15} /></Link>
        <button onClick={onLogout} className={`${ghostButtonClass} !text-red-400`}><LogOut size={15} /></button>
      </div>
    </div>
  );
}
