/**
 * Lightweight route transition. Ordinary navigation must not impersonate a
 * heavy background job with a page full of skeleton cards. The existing shell
 * remains stable while this small, accessible progress surface covers only the
 * content transition.
 */
export default function AppLoading() {
  return (
    <div className="relative min-h-24 overflow-hidden rounded-3xl border border-navy-100 bg-white/70 p-5 dark:border-navy-800 dark:bg-navy-900/60" role="status" aria-live="polite">
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-navy-100 dark:bg-navy-800"><span className="block h-full w-1/3 animate-[pulse_0.9s_ease-in-out_infinite] rounded-full bg-green-500" /></div>
      <p className="text-sm font-bold text-navy-900 dark:text-white">Opening workspace…</p>
      <p className="mt-1 text-xs text-navy-400">Keeping your navigation and current context in place.</p>
    </div>
  );
}
