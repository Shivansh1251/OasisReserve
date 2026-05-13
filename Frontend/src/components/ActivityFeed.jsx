import { Clock3 } from 'lucide-react';

export function ActivityFeed({ items = [] }) {
  return (
    <div className="dashboard-card h-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Recent activity</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest system actions and reservation events</p>
        </div>
        <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">Updated now</span>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            No recent activity yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-white/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Clock3 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <span className="shrink-0 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{item.subtitle}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {new Intl.DateTimeFormat('en', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(item.timestamp))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}