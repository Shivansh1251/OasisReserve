import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { request } from '../api/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current month/year

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => request('/api/reservations', { method: 'GET' }),
  });

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const reservationsByDate = useMemo(() => {
    const map = {};
    reservations.forEach((r) => {
      const date = new Date(r.bookingDate).toDateString();
      if (!map[date]) map[date] = [];
      map[date].push(r);
    });
    return map;
  }, [reservations]);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getReservationsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return reservationsByDate[date] || [];
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
      case 'pending':
        return 'bg-amber-500/20 border-amber-400 text-amber-300';
      case 'cancelled':
        return 'bg-rose-500/20 border-rose-400 text-rose-300';
      default:
        return 'bg-slate-500/20 border-slate-400 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reservation Calendar</h1>
        <p className="text-slate-400">View and manage bookings by date</p>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-8 rounded-lg border border-white/10"
      >
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white w-48 text-center">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`min-h-32 rounded-lg border transition ${
                day === null
                  ? 'bg-slate-900/50 border-transparent'
                  : 'border-white/10 hover:border-white/20 cursor-pointer group'
              }`}
            >
              {day !== null && (
                <div className="h-full p-2 flex flex-col">
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString()
                        ? 'text-brand-400'
                        : 'text-slate-300'
                    }`}>
                      {day}
                    </span>
                  </div>

                  {/* Reservations */}
                    <div className="flex-1 space-y-1 mt-1 overflow-y-auto">
                    {getReservationsForDay(day).map((reservation, ridx) => (
                      <motion.div
                        key={ridx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-xs p-1 rounded border truncate font-medium ${getStatusColor(
                          reservation.status
                        )}`}
                        title={`${reservation.customerId?.name} - ${reservation.serviceId?.name}`}
                      >
                        {reservation.customerId?.name}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4 rounded-lg border border-white/10"
      >
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-300">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-slate-300">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-sm text-slate-300">Cancelled</span>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Reservations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="glass-panel p-6 rounded-lg border border-white/10"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upcoming Bookings</h3>
        <div className="space-y-3">
          {reservations
            .filter((r) => new Date(r.bookingDate) >= new Date())
            .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
            .slice(0, 8)
            .map((reservation) => (
              <motion.div
                key={reservation._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{reservation.customerId?.name}</p>
                  <p className="text-sm text-slate-400">{reservation.serviceId?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(reservation.bookingDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    reservation.status
                  )}`}
                >
                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
