'use client';
import { Plus, Trash2 } from 'lucide-react';
import { Field, Select } from './fields';
import ImageDrop from './ImageDrop';
import { ghostButtonClass } from './styles';

export type ListField<T> = { key: keyof T & string; label: string; options?: string[]; image?: boolean };

/** Editable list of small records (links, facts, services, certifications …). */
export default function ListEditor<T extends Record<string, string>>({ items, fields, blank, onChange }: {
  items: T[]; fields: ListField<T>[]; blank: T; onChange: (newItems: T[]) => void;
}) {
  const setItemField = (itemIndex: number, fieldKey: string, value: string) => onChange(items.map((item, otherIndex) => (otherIndex === itemIndex ? { ...item, [fieldKey]: value } : item)));
  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className="grid sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))_auto] gap-3 items-end p-3 rounded-xl bg-white/[.02] border border-accent/10">
          {fields.map((field) => field.image
            ? <div key={field.key} className="sm:col-span-full"><ImageDrop label={field.label} value={item[field.key]} onChange={(value) => setItemField(itemIndex, field.key, value)} /></div>
            : field.options
              ? <Select key={field.key} label={field.label} value={item[field.key]} options={field.options} onChange={(value) => setItemField(itemIndex, field.key, value)} />
              : <Field key={field.key} label={field.label} value={item[field.key]} onChange={(value) => setItemField(itemIndex, field.key, value)} />)}
          <button className={`${ghostButtonClass} !text-red-400`} onClick={() => onChange(items.filter((_, otherIndex) => otherIndex !== itemIndex))} aria-label="Remove"><Trash2 size={14} /></button>
        </div>
      ))}
      <button className={ghostButtonClass} onClick={() => onChange([...items, { ...blank }])}><Plus size={14} /> Add</button>
    </div>
  );
}
