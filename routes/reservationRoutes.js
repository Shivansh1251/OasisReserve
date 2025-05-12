const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// CREATE a new reservation
router.post('/', async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    const saved = await newReservation.save();
    const populatedReservation = await Reservation.findById(saved._id)
      .populate('customerId', 'name email')
      .populate('serviceId', 'name price');
    console.log('New reservation made:', populatedReservation); // Log reservation details
    res.status(201).json(populatedReservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET reservations for the logged-in user
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('customerId', 'name email')
      .populate('serviceId', 'name price');
    res.json(reservations);
  } catch (err) {
    console.error("Error fetching reservations:", err.message); // Log the error
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// GET reservations for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ customerId: req.params.userId })
      .populate('customerId', 'name email')
      .populate('serviceId', 'name price');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('customerId serviceId');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE reservation
router.put('/:id', async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Reservation not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE reservation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
