export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel flex w-full max-w-md items-center gap-4 rounded-3xl p-6">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}