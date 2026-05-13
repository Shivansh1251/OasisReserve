import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { request } from '../api/client';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month'); // month, quarter, year
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: overview = {} } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => request('/api/dashboard/overview', { method: 'GET' }),
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => request('/api/reservations', { method: 'GET' }),
  });
  const { isDark } = useTheme();
  const axisColor = isDark ? 'rgba(248, 250, 252, 0.55)' : 'rgba(51, 65, 85, 0.65)';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.28)';
  const tooltipStyles = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(148, 163, 184, 0.3)'}`,
    borderRadius: '8px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: isDark ? 'none' : '0 18px 40px rgba(15, 23, 42, 0.12)',
  };

  const metrics = useMemo(() => {
    const filtered = reservations.filter((r) => {
      const date = new Date(r.bookingDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const totalRevenue = filtered.reduce((sum, r) => sum + (r.serviceId?.price || 0), 0);
    const confirmed = filtered.filter((r) => r.status === 'confirmed').length;
    const pending = filtered.filter((r) => r.status === 'pending').length;
    const cancelled = filtered.filter((r) => r.status === 'cancelled').length;

    const revenueByStatus = [
      { name: 'Confirmed', value: filtered.filter((r) => r.status === 'confirmed').reduce((s, r) => s + (r.serviceId?.price || 0), 0) },
      { name: 'Pending', value: filtered.filter((r) => r.status === 'pending').reduce((s, r) => s + (r.serviceId?.price || 0), 0) },
      { name: 'Cancelled', value: filtered.filter((r) => r.status === 'cancelled').reduce((s, r) => s + (r.serviceId?.price || 0), 0) },
    ];

    const dailyTrend = {};
    filtered.forEach((r) => {
      const date = new Date(r.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyTrend[date] = (dailyTrend[date] || 0) + (r.serviceId?.price || 0);
    });

    const trendData = Object.entries(dailyTrend)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-14)
      .map(([date, revenue]) => ({ date, revenue }));

    return { totalRevenue, confirmed, pending, cancelled, revenueByStatus, trendData };
  }, [reservations, startDate, endDate]);

  const exportCSV = () => {
    const csvContent = [
      ['Report Date Range', `${startDate} to ${endDate}`],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', `$${metrics.totalRevenue.toFixed(2)}`],
      ['Confirmed Bookings', metrics.confirmed],
      ['Pending Bookings', metrics.pending],
      ['Cancelled Bookings', metrics.cancelled],
      [],
      ['Reservation Details'],
      ['Booking Date', 'Customer', 'Service', 'Price', 'Status'],
      ...reservations
        .filter((r) => {
          const date = new Date(r.bookingDate);
          return date >= new Date(startDate) && date <= new Date(endDate);
        })
        .map((r) => [
          new Date(r.bookingDate).toLocaleDateString(),
          r.customerId?.name || 'N/A',
          r.serviceId?.name || 'N/A',
          r.serviceId?.price || 0,
          r.status,
        ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `oasis-report-${startDate}-to-${endDate}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report exported as CSV');
  };

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-slate-700 dark:text-slate-400">Detailed insights and performance metrics</p>
          </div>
          <motion.button
            onClick={exportCSV}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition hover:bg-brand-500/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="glass-panel p-4 rounded-lg border border-white/10 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input px-3 py-2 rounded-lg border border-white/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input px-3 py-2 rounded-lg border border-white/10"
            />
          </div>
          <div className="flex gap-2">
            {['month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  const end = new Date();
                  const start = new Date();
                  if (range === 'month') start.setMonth(end.getMonth() - 1);
                  else if (range === 'quarter') start.setMonth(end.getMonth() - 3);
                  else start.setFullYear(end.getFullYear() - 1);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  dateRange === range
                    ? 'glass-button bg-brand-500/20 border-brand-400'
                    : 'border border-white/10 text-slate-700 dark:text-slate-300 hover:border-white/20'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Revenue', value: `$${metrics.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'emerald' },
          { label: 'Confirmed', value: metrics.confirmed, icon: '✓', color: 'emerald' },
          { label: 'Pending', value: metrics.pending, icon: '⏱', color: 'amber' },
          { label: 'Cancelled', value: metrics.cancelled, icon: '✕', color: 'rose' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05 }}
            className={`glass-panel p-6 rounded-lg border border-white/10 ${
              card.color === 'emerald'
                ? 'border-emerald-500/20'
                : card.color === 'amber'
                  ? 'border-amber-500/20'
                  : 'border-rose-500/20'
            }`}
          >
            <p className="text-slate-700 dark:text-slate-400 text-sm mb-2">{card.label}</p>
            <p className={`text-2xl font-bold ${
              card.color === 'emerald'
                ? 'text-emerald-400'
                : card.color === 'amber'
                  ? 'text-amber-400'
                  : 'text-rose-400'
            }`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-lg border border-white/10"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <Tooltip
                contentStyle={tooltipStyles}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2a9af0"
                strokeWidth={2}
                dot={{ fill: '#2a9af0' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-6 rounded-lg border border-white/10"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.revenueByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyles} formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Booking Details Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6 rounded-lg border border-white/10"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reservation Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
                <tr className="text-slate-700 dark:text-slate-400">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Service</th>
                <th className="text-right py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations
                .filter((r) => {
                  const date = new Date(r.bookingDate);
                  return date >= new Date(startDate) && date <= new Date(endDate);
                })
                .slice(-10)
                .map((r) => (
                  <tr key={r._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {new Date(r.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.customerId?.name}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.serviceId?.name}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                      ${r.serviceId?.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : r.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
