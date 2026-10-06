import { Trash2 } from 'lucide-react';
import { ghostButtonClass } from '../styles';
import type { Admin } from '../useAdmin';

export default function MessagesSection({ admin }: { admin: Admin }) {
  const { messages } = admin;
  return (
    <div className="space-y-4">
      {messages.length === 0 && <p className="text-mute">No messages yet.</p>}
      {messages.map((message) => (
        <div key={message.id} className={`glass p-5 ${message.read ? '' : '!border-accent/60'}`}>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div><b>{message.name}</b> <a href={`mailto:${message.email}`} className="text-accent text-sm">{message.email}</a></div>
            <div className="flex items-center gap-3 text-xs text-mute">
              <span className={`chip ${message.notified ? '' : '!text-red-400 !border-red-400/40'}`}>{message.notified ? 'emailed' : 'not emailed'}</span>
              {new Date(message.created_at).toLocaleString()}
            </div>
          </div>
          <p className="mt-3 text-sm whitespace-pre-wrap leading-6">{message.message}</p>
          <div className="mt-4 flex gap-3">
            <button className={ghostButtonClass} onClick={() => admin.toggleRead(message)}>{message.read ? 'Mark unread' : 'Mark read'}</button>
            <button className={`${ghostButtonClass} !text-red-400`} onClick={() => admin.deleteItem('messages', message.id)}><Trash2 size={14} /> Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
