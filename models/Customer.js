const mongoose = require('mongoose');
const Reservation = require('./Reservation');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, match: /^[0-9]{10}$/, required: false },
});

customerSchema.pre('findOneAndDelete', async function (next) {
  try {
    const customerId = this.getQuery()["_id"];
    await Reservation.deleteMany({ customerId });
    next();
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
});

module.exports = mongoose.model('Customer', customerSchema);
