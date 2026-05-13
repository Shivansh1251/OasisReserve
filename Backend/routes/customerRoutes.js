const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Reservation = require('../models/Reservation');
const { requireAuth, requireRole } = require('../middleware/auth');

async function withReservationCounts(customers) {
  const counts = await Reservation.aggregate([
    { $group: { _id: '$customerId', total: { $sum: 1 } } },
  ]);

  const countMap = counts.reduce((accumulator, item) => {
    accumulator[String(item._id)] = item.total;
    return accumulator;
  }, {});

  return customers.map((customer) => ({
    ...customer.toObject ? customer.toObject() : customer,
    reservations: Array.from({ length: countMap[String(customer._id)] || 0 }),
    reservationCount: countMap[String(customer._id)] || 0,
  }));
}

// CREATE a new customer
router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    console.log('New customer added:', savedCustomer); // Log customer details
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all customers
router.get('/', requireAuth, requireRole(['admin', 'staff', 'receptionist']), async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(await withReservationCounts(customers));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one customer by ID
router.get('/:id', requireAuth, requireRole(['admin', 'staff', 'receptionist']), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const [hydrated] = await withReservationCounts([customer]);
    res.json(hydrated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE customer
router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE customer
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
