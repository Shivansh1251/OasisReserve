import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, X, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchReservations } from '../api/reservations';
import { request } from '../api/client';
import toast from 'react-hot-toast';

const statusOptions = ['all', 'confirmed', 'pending', 'cancelled'];

export function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ customerId: '', serviceId: '', bookingDate: '', status: 'confirmed' });
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => request('/api/customers', { method: 'GET' }),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => request('/api/services', { method: 'GET' }),
  });

  const createReservationMutation = useMutation({
    mutationFn: (data) => request('/api/reservations', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      toast.success('Reservation created');
      setFormData({ customerId: '', serviceId: '', bookingDate: '', status: 'confirmed' });
      setShowModal(false);
    },
    onError: () => toast.error('Failed to create reservation'),
  });

  const handleCreateReservation = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.serviceId || !formData.bookingDate) {
      toast.error('Please fill all fields');
      return;
    }
    createReservationMutation.mutate(formData);
  };

  const reservationsQuery = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
    staleTime: 30 * 1000,
  });

  const location = useLocation();

  useEffect(() => {
    if (location?.state?.openNew) {
      setShowModal(true);
      // clear state if needed
      try {
        window.history.replaceState({ ...(window.history.state || {}), usr: null }, '');
      } catch (e) {
        // ignore
      }
    }
  }, [location]);

  const filteredReservations = useMemo(() => {
    const reservations = reservationsQuery.data || [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...reservations]
      .filter((reservation) => {
        const customerName = reservation.customerId?.name || '';
        const serviceName = reservation.serviceId?.name || '';
        const matchesSearch = !normalizedSearch || `${customerName} ${serviceName}`.toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((firstReservation, secondReservation) => {
        const firstDate = new Date(firstReservation.bookingDate).getTime();
        const secondDate = new Date(secondReservation.bookingDate).getTime();

        if (sortBy === 'date-asc') {
          return firstDate - secondDate;
        }

        return secondDate - firstDate;
      });
  }, [reservationsQuery.data, searchTerm, statusFilter, sortBy]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="dashboard-card flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Reservations</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Search, filter, and sort bookings</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Client-side controls on top of the live reservations API.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="glass-button px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition hover:bg-brand-500/20">
            <Plus className="h-4 w-4" />
            New Reservation
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
            <SlidersHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">Live filters</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.6fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search guest or service"
            className="glass-input pl-11"
          />
        </label>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="glass-input">
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="glass-input">
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
        </select>
      </div>

      <div className="dashboard-card overflow-hidden">
        {reservationsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : reservationsQuery.isError ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            Reservation data could not be loaded.
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            No reservations match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/70 dark:divide-white/10">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="transition hover:bg-slate-50/80 dark:hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{reservation.customerId?.name || 'Guest'}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{reservation.customerId?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{reservation.serviceId?.name || 'Service'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(reservation.bookingDate))}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-800 dark:text-brand-300">
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Reservation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-lg max-w-md w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">New Reservation</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Guest</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                  >
                    <option value="">Select a guest...</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Service</label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                  >
                    <option value="">Select a service...</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - ${service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Booking Date</label>
                  <input
                    type="datetime-local"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReservationMutation.isPending}
                    className="flex-1 glass-button px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}