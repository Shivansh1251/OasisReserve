import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-lg rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              !
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Something broke</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              The dashboard hit an unexpected runtime error. Refresh the page or reopen the app to continue.
            </p>
            <p className="mt-4 font-mono text-xs text-slate-500 dark:text-slate-500">{String(this.state.error?.message || 'Unknown error')}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}