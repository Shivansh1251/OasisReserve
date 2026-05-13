import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from '../api/client';

export default function UsersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => request('/api/users', { method: 'GET' }),
    enabled: true,
  });

  const users = data?.users || [];

  if (isLoading) return <div className="p-6">Loading users...</div>;
  if (isError) return <div className="p-6">Failed to load users</div>;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team & Staff</h1>
        <p className="text-slate-400">Admin-only view of all user accounts</p>
      </div>

      <div className="glass-panel p-4 rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id || u.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-slate-500">{u._id || u.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-500">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
