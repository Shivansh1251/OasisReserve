const mongoose = require('mongoose');
const Reservation = require('./Reservation');

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: { type: String, required: false },
});

customerSchema.pre('findOneAndDelete', async function (next) {
  const customerId = this.getQuery()["_id"];
  await Reservation.deleteMany({ customerId });
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
