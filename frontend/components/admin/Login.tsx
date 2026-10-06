'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { inputClass, primaryButtonClass } from './styles';

/** Access-code screen. `onLogin` resolves to an error message, or null on success. */
export default function Login({ onLogin }: { onLogin: (code: string) => Promise<string | null> }) {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const submit = async () => {
    setErrorMessage(''); setIsChecking(true);
    const error = await onLogin(code);
    if (error) setErrorMessage(error); else setCode('');
    setIsChecking(false);
  };

  return (
    <div className="fixed inset-0 z-10 grid place-items-center p-5">
      <div className="glass p-8 w-full max-w-sm text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/15 grid place-items-center text-accent shadow-[0_0_30px_rgb(var(--accent)/.3)]"><Lock /></div>
        <h1 className="mt-5 text-2xl font-bold">Private CMS</h1>
        <p className="text-sm text-mute mt-1">Enter your access code to continue</p>
        <div className="relative mt-6">
          <input
            type={isCodeVisible ? 'text' : 'password'} autoFocus value={code}
            onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()}
            placeholder="Access code" className={`${inputClass} text-center px-11`}
          />
          <button type="button" onClick={() => setIsCodeVisible(!isCodeVisible)} aria-label={isCodeVisible ? 'Hide code' : 'Show code'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-accent transition">
            {isCodeVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errorMessage && <p className="text-red-400 text-sm mt-3">{errorMessage}</p>}
        <button onClick={submit} disabled={isChecking || !code} className={`${primaryButtonClass} w-full justify-center mt-5`}>{isChecking ? 'Checking…' : 'Unlock'}</button>
        <Link href="/" className="block mt-5 text-xs text-mute hover:text-accent">← Back to site</Link>
      </div>
    </div>
  );
}
