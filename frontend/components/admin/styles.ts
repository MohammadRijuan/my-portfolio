/** Shared Tailwind class strings for the CMS. */
export const inputClass =
  'w-full rounded-xl bg-white/[.04] border border-accent/20 px-4 py-2.5 text-sm outline-none focus:border-accent focus:bg-accent/5 transition placeholder:text-mute/60';
export const buttonBaseClass =
  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50';
export const primaryButtonClass = `${buttonBaseClass} bg-gradient-to-r from-accent to-accent2 text-black shadow-[0_0_24px_rgb(var(--accent)/.3)]`;
export const ghostButtonClass = `${buttonBaseClass} glass !rounded-xl`;
