const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  bookingDate: Date,
  status: { type: String, default: 'confirmed' },
});

module.exports = mongoose.model('Reservation', reservationSchema);
