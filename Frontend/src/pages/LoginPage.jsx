import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, KeyRound, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [formState, setFormState] = useState({ email: 'admin@oasisreserve.com', password: 'Admin@123456' });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success('Welcome back');
      navigate(from, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || 'Unable to sign in');
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    loginMutation.mutate(formState);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden px-6 py-10 lg:px-12 lg:py-14"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_26%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_32%)]" />
        <div className="mx-auto flex h-full max-w-3xl flex-col justify-between rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-600 dark:text-brand-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-500">OasisReserve</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hospitality intelligence platform</p>
            </div>
          </div>

          <div className="max-w-2xl py-16 lg:py-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/15 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-200">
              <Sparkles className="h-4 w-4" />
              SaaS-grade operations dashboard
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white lg:text-7xl">
              Premium hospitality command center for modern teams.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Manage reservations, track revenue, monitor occupancy, and keep service teams aligned with a polished, product-company style interface.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Occupancy', value: '92%' },
                { label: 'Revenue', value: '$84.2k' },
                { label: 'Active staff', value: '18' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              <UserRound className="h-4 w-4" />
              Admin / Staff / Receptionist roles
            </div>
            <div className="hidden rounded-full border border-slate-200 bg-white/70 px-4 py-2 font-mono dark:border-white/10 dark:bg-white/5 md:block">
              JWT access + refresh sessions
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center px-6 py-10 lg:px-10"
      >
        <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Access your dashboard</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Use your dashboard credentials to continue into the OasisReserve control plane.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                className="glass-input"
                placeholder="admin@oasisreserve.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
              <input
                type="password"
                value={formState.password}
                onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                className="glass-input"
                placeholder="Admin@123456"
              />
            </label>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              <KeyRound className="h-4 w-4" />
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-brand-500/15 bg-brand-500/10 p-4 text-sm text-brand-700 dark:text-brand-200">
            <p className="font-semibold">Test credentials:</p>
            <p className="mt-2 font-mono text-xs">admin@oasisreserve.com / Admin@123456</p>
            <p className="font-mono text-xs">staff@oasisreserve.com / Staff@123456</p>
            <p className="font-mono text-xs">receptionist@oasisreserve.com / Receptionist@123456</p>
          </div>

          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
              Create one here
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}