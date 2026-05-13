import { motion } from 'framer-motion';
import { CalendarCheck2, DollarSign, Hotel, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { request } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useDashboardOverview } from '../hooks/useDashboardOverview';
import { ActivityFeed } from '../components/ActivityFeed';
import { BookingTrendsChart, ReservationStatusChart } from '../components/DashboardChart';
import { MetricCard } from '../components/MetricCard';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const overviewQuery = useDashboardOverview();

  if (overviewQuery.isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="dashboard-card h-36 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="dashboard-card h-[28rem] animate-pulse" />
          <div className="dashboard-card h-[28rem] animate-pulse" />
        </div>
      </div>
    );
  }

  if (overviewQuery.isError) {
    return (
      <div className="dashboard-card mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Unable to load dashboard data</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">The analytics endpoint could not be reached. Try again after checking the backend.</p>
        <button
          type="button"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
            toast.success('Retrying dashboard data');
          }}
          className="glass-button mt-6"
        >
          Retry
        </button>
      </div>
    );
  }

  const overview = overviewQuery.data;
  const metrics = overview.metrics || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <section className="dashboard-card overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Command center</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white lg:text-5xl">
              Operation overview for hospitality teams.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Monitor revenue, occupancy, reservations, and activity from a polished SaaS interface built for speed and clarity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const reservations = await request('/api/reservations', { method: 'GET' });
                  // simple CSV export similar to ReportsPage
                  const csvRows = [
                    ['Booking Date', 'Customer', 'Service', 'Price', 'Status'],
                    ...reservations.map((r) => [
                      new Date(r.bookingDate).toLocaleDateString(),
                      r.customerId?.name || 'N/A',
                      r.serviceId?.name || 'N/A',
                      r.serviceId?.price || 0,
                      r.status,
                    ]),
                  ];

                  const csvContent = csvRows.map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
                  const a = document.createElement('a');
                  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
                  a.download = `oasis-report.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  toast.success('Report exported');
                } catch (err) {
                  toast.error('Failed to export report');
                }
              }}
              className="glass-button"
            >
              Export report
            </button>
            <button
              type="button"
              onClick={() => navigate('/reservations', { state: { openNew: true } })}
              className="glass-button bg-slate-950 text-white dark:bg-white dark:text-slate-950"
            >
              New reservation
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard index={0} label="Revenue" value={formatCurrency(metrics.revenue)} delta="Projected bookings and service revenue" icon={<DollarSign className="h-5 w-5" />} tone="emerald" />
        <MetricCard index={1} label="Occupancy" value={`${metrics.occupancyRate || 0}%`} delta="Confirmed reservations vs total bookings" icon={<Hotel className="h-5 w-5" />} tone="brand" />
        <MetricCard index={2} label="Reservations" value={metrics.reservations || 0} delta="All reservations currently tracked" icon={<CalendarCheck2 className="h-5 w-5" />} tone="amber" />
        <MetricCard index={3} label="Customers" value={metrics.customers || 0} delta="Guest profiles and contacts" icon={<Users className="h-5 w-5" />} tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <BookingTrendsChart series={overview.monthlyReservations} />
        <ReservationStatusChart statusCounts={metrics.statusCounts} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ActivityFeed items={overview.recentActivity} />
        <div className="dashboard-card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Platform snapshot</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Operational signals for the next shift</p>
          </div>

          <div className="space-y-4">
            {[
              ['Active services', metrics.services || 0],
              ['Staff online', metrics.users || 0],
              ['Confirmed bookings', metrics.statusCounts?.confirmed || 0],
              ['Pending bookings', metrics.statusCounts?.pending || 0],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}