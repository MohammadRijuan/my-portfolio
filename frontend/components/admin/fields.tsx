import type { ReactNode } from 'react';
import { inputClass } from './styles';

export function Field({ label, value, onChange, multiline = false, type = 'text' }: {
  label: string; value: string | number; onChange: (value: string) => void; multiline?: boolean; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-mute mb-1.5 block">{label}</span>
      {multiline
        ? <textarea rows={4} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
        : <input type={type} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

export function Select({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-mute mb-1.5 block">{label}</span>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
      </select>
    </label>
  );
}

export function Panel({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="glass p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
