import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { Toast } from './types';

/** Top-right toast notifications. */
export default function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-3 sm:w-[22rem] pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-in pointer-events-auto glass !rounded-2xl overflow-hidden flex items-center gap-3 pl-4 pr-3 py-3.5 shadow-2xl">
          {toast.type === 'err' ? <AlertCircle size={20} className="text-red-400 shrink-0" /> : <CheckCircle2 size={20} className="text-accent shrink-0" />}
          <span className="text-sm flex-1">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss" className="text-mute hover:text-fg"><X size={15} /></button>
          <span className={`toast-bar absolute bottom-0 left-0 h-0.5 ${toast.type === 'err' ? 'bg-red-400' : 'bg-accent'}`} />
        </div>
      ))}
    </div>
  );
}
