const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true }, // Ensure email is stored in lowercase
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'receptionist', 'customer', 'user'], default: 'staff' },
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Ensure email is always saved in lowercase
userSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});

module.exports = mongoose.model('User', userSchema);
