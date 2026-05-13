import { motion } from 'framer-motion';

export function MetricCard({ icon, label, value, delta, tone = 'brand', index = 0 }) {
  const toneMap = {
    brand: 'from-brand-500 to-sky-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="dashboard-card relative overflow-hidden"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneMap[tone]}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{delta}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${toneMap[tone]} p-3 text-white shadow-glow`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}