const express = require('express');
const Reservation = require('../models/Reservation');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['admin', 'staff', 'receptionist']));

router.get('/overview', async (req, res) => {
  try {
    const [customerCount, serviceCount, allReservations, recentReservations, userCount] = await Promise.all([
      Customer.countDocuments(),
      Service.countDocuments(),
      Reservation.find()
        .populate('serviceId', 'price name')
        .populate('customerId', 'name email')
        .sort({ bookingDate: -1 }),
      Reservation.find()
        .populate('serviceId', 'price name')
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
      User.countDocuments(),
    ]);

    const totalRevenue = allReservations.reduce((sum, reservation) => {
      const servicePrice = reservation.serviceId?.price || 0;
      return sum + servicePrice;
    }, 0);

    const statusCounts = allReservations.reduce(
      (accumulator, reservation) => {
        accumulator[reservation.status] = (accumulator[reservation.status] || 0) + 1;
        return accumulator;
      },
      { confirmed: 0, pending: 0, cancelled: 0 }
    );

    const monthlyReservations = Array.from({ length: 6 }, (_, offset) => {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - (5 - offset));
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();

      return {
        month: monthDate.toLocaleString('en-US', { month: 'short' }),
        bookings: allReservations.filter((reservation) => {
          const bookingDate = new Date(reservation.bookingDate);
          return bookingDate.getMonth() === month && bookingDate.getFullYear() === year;
        }).length,
      };
    });

    const recentActivity = recentReservations.map((reservation) => ({
      id: reservation._id,
      type: 'reservation',
      title: `${reservation.customerId?.name || 'Guest'} booked ${reservation.serviceId?.name || 'a service'}`,
      subtitle: reservation.status,
      timestamp: reservation.createdAt,
    }));

    res.json({
      metrics: {
        customers: customerCount,
        services: serviceCount,
        reservations: allReservations.length,
        users: userCount,
        revenue: totalRevenue,
        occupancyRate: allReservations.length ? Math.round((statusCounts.confirmed / allReservations.length) * 100) : 0,
        statusCounts,
      },
      monthlyReservations,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard overview', details: error.message });
  }
});

module.exports = router;