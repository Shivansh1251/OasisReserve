import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../api/auth';
import { request } from '../api/client';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/cn';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { label: 'Dashboard', path: '/', badge: 'Overview' },
  { label: 'Reservations', path: '/reservations', badge: 'Ops' },
  { label: 'Customers', path: '/customers', badge: 'Guests' },
  { label: 'Services', path: '/services', badge: 'Catalog' },
  { label: 'Reports', path: '/reports', badge: 'Analytics' },
  { label: 'Calendar', path: '/calendar', badge: 'Schedule' },
];

function CommandPalette({ open, onClose, onAction, userRole }) {
  const commands = [
    { label: 'Go to dashboard', hint: 'Overview cards', action: () => onAction('/') },
    { label: 'Open reservations', hint: 'Manage bookings', action: () => onAction('/reservations') },
    { label: 'View customers', hint: 'Guest management', action: () => onAction('/customers') },
    { label: 'Manage services', hint: 'Pricing & catalog', action: () => onAction('/services') },
    { label: 'View reports', hint: 'Analytics & insights', action: () => onAction('/reports') },
    { label: 'Open calendar', hint: 'Booking schedule', action: () => onAction('/calendar') },
    { label: 'Toggle theme', hint: 'Dark / light', action: () => onAction('theme') },
  ].filter((command) => {
    if (userRole === 'customer') {
      return ['Manage services', 'Toggle theme'].includes(command.label);
    }

    if (userRole === 'receptionist') {
      return command.label !== 'View reports' && command.label !== 'View customers';
    }

    return true;
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 pt-24 backdrop-blur-sm"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            className="glass-panel w-full max-w-2xl overflow-hidden rounded-3xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  placeholder="Search commands, reports, bookings..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="p-3">
              {commands.map((command) => (
                <button
                  key={command.label}
                  type="button"
                  onClick={command.action}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100/80 dark:hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{command.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{command.hint}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:border-white/10">Enter</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data } = useAuth();
  const userRole = data?.user?.role;
  const { toggleTheme } = useTheme();

  const visibleNavItems = userRole === 'customer'
    ? navItems.filter((item) => item.path === '/services')
    : navItems;

  useEffect(() => {
    if (userRole === 'customer' && location.pathname === '/') {
      navigate('/services', { replace: true });
    }
  }, [location.pathname, navigate, userRole]);

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => request('/api/dashboard/overview', { method: 'GET' }),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const notifications = (dashboardData?.recentActivity || []).slice(0, 5).map((activity) => ({
    // backend returns a preformatted title/subtitle; support both shapes
    title: activity.title || `${activity.customerName || 'Guest'} booked ${activity.serviceName || 'a service'}`,
    subtitle: activity.subtitle
      ? activity.subtitle
      : new Date(activity.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    status: activity.status || (activity.subtitle || '').toLowerCase() || 'confirmed',
  }));

  async function handleLogout() {
    await logout();
    queryClient.removeQueries({ queryKey: ['session'] });
    toast.success('Logged out');
    navigate('/login', { replace: true });
  }

  function handleCommandAction(action) {
    if (action === 'theme') {
      toggleTheme();
      setCommandPaletteOpen(false);
      return;
    }

    navigate(action);
    setCommandPaletteOpen(false);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-80 border-r border-white/60 bg-white/70 px-5 py-6 shadow-soft backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/70 lg:sticky lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex h-full flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">OasisReserve</p>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Hospitality OS</h1>
              </div>
              <div className="rounded-2xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-300">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <nav className="space-y-2">
              {visibleNavItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition',
                      active
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'bg-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/5'
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className={cn('rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]', active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500')}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
              {userRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/users');
                    setSidebarOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition bg-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <span className="font-medium">Staff</span>
                  <span className={cn('rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]', 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500')}>
                    Team
                  </span>
                </button>
              )}
            </nav>

            <div className="mt-auto rounded-3xl border border-white/60 bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white shadow-soft dark:border-white/10">
              <p className="text-xs uppercase tracking-[0.25em] text-white/55">Session</p>
              <p className="mt-2 text-lg font-semibold">{data?.user?.name || 'Oasis team'}</p>
              <p className="mt-1 text-sm text-white/70">{data?.user?.role || 'staff'} role active</p>
              <button type="button" onClick={handleLogout} className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/50 bg-white/65 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 lg:px-8">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen((current) => !current)} className="glass-button h-11 w-11 p-0 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setCommandPaletteOpen(true)} className="glass-button flex-1 justify-start px-4 text-slate-500">
                <Search className="h-4 w-4" />
                <span>Search dashboard</span>
                <span className="ml-auto rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:border-white/10 dark:bg-white/5">
                  Ctrl K
                </span>
              </button>
              <ThemeToggle compact />
              <div className="relative">
                <button type="button" onClick={() => setNotificationsOpen((current) => !current)} className="glass-button h-11 w-11 p-0">
                  <Bell className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {notificationsOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 top-14 w-80 rounded-3xl border border-white/70 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Notification center</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Recent activity</p>
                        </div>
                        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">{notifications.length} new</span>
                      </div>
                      <div className="space-y-3">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div key={notification.title} className={`rounded-2xl border p-3 ${
                              notification.status === 'confirmed'
                                ? 'border-emerald-200/80 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                                : notification.status === 'pending'
                                  ? 'border-amber-200/80 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10'
                                  : 'border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                            }`}>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{notification.title}</p>
                              <div className="mt-1 flex items-center justify-between">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{notification.subtitle}</p>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  notification.status === 'confirmed'
                                    ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-200'
                                    : notification.status === 'pending'
                                      ? 'bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-200'
                                      : 'bg-slate-200 text-slate-800 dark:bg-slate-500/30 dark:text-slate-200'
                                }`}>
                                  {notification.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                            <p className="text-sm">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onAction={handleCommandAction}
        userRole={userRole}
      />
    </div>
  );
}