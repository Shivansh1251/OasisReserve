import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const pieColors = ['#22c55e', '#f59e0b', '#ef4444'];

export function BookingTrendsChart({ series }) {
  const data = useMemo(() => series || [], [series]);
  const { isDark } = useTheme();
  const axisColor = isDark ? 'rgba(248, 250, 252, 0.55)' : 'rgba(51, 65, 85, 0.65)';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.28)';
  const tooltipStyles = {
    borderRadius: 16,
    border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.3)'}`,
    background: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: isDark ? 'none' : '0 18px 40px rgba(15, 23, 42, 0.12)',
  };

  return (
    <div className="dashboard-card h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Booking trends</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly reservations across the last six months</p>
        </div>
        <span className="rounded-full border border-brand-500/15 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">Live overview</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <defs>
              <linearGradient id="bookingBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
              contentStyle={tooltipStyles}
            />
            <Bar dataKey="bookings" fill="url(#bookingBar)" radius={[12, 12, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ReservationStatusChart({ statusCounts }) {
  const data = useMemo(
    () => [
      { name: 'Confirmed', value: statusCounts?.confirmed || 0 },
      { name: 'Pending', value: statusCounts?.pending || 0 },
      { name: 'Cancelled', value: statusCounts?.cancelled || 0 },
    ],
    [statusCounts]
  );
  const { isDark } = useTheme();
  const legendColor = isDark ? '#cbd5e1' : '#475569';
  const tooltipStyles = {
    borderRadius: 16,
    border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.3)'}`,
    background: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: isDark ? 'none' : '0 18px 40px rgba(15, 23, 42, 0.12)',
  };

  return (
    <div className="dashboard-card h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Booking health</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Status distribution for operational monitoring</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={74} outerRadius={108} paddingAngle={4} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyles}
            />
            <Legend wrapperStyle={{ color: legendColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}