const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Reservation = require('../models/Reservation');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/oasisreserve');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seed() {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Service.deleteMany({});
    await Reservation.deleteMany({});

    console.log('Seeding users...');
    const users = [
      { name: 'Admin User', email: 'admin@oasisreserve.com', password: 'Admin@123456', role: 'admin' },
      { name: 'Staff Member', email: 'staff@oasisreserve.com', password: 'Staff@123456', role: 'staff' },
      { name: 'Receptionist', email: 'receptionist@oasisreserve.com', password: 'Receptionist@123456', role: 'receptionist' },
    ];

    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const createdUser = await User.create({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      });
      createdUsers.push(createdUser);
      console.log(`✓ Created ${user.role}: ${user.email}`);
    }

    console.log('\nSeeding customers...');
    const customers = [
      { name: 'John Doe', email: 'john@example.com', phone: '5551234567' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '5559876543' },
      { name: 'Bob Wilson', email: 'bob@example.com', phone: '5555551234' },
      { name: 'Alice Brown', email: 'alice@example.com', phone: '5552224444' },
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const created = await Customer.create(customer);
      createdCustomers.push(created);
      console.log(`✓ Created customer: ${customer.name}`);
    }

    console.log('\nSeeding services...');
    const services = [
      { name: 'Standard Room', price: 120 },
      { name: 'Deluxe Room', price: 180 },
      { name: 'Suite', price: 300 },
      { name: 'Spa Treatment', price: 85 },
      { name: 'Restaurant Access', price: 50 },
    ];

    const createdServices = [];
    for (const service of services) {
      const created = await Service.create(service);
      createdServices.push(created);
      console.log(`✓ Created service: ${service.name}`);
    }

    console.log('\nSeeding reservations...');
    const reservations = [];
    for (let i = 0; i < 12; i++) {
      const randomCustomer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const randomService = createdServices[Math.floor(Math.random() * createdServices.length)];
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 60) - 30);

      const statuses = ['confirmed', 'pending', 'cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const reservation = await Reservation.create({
        customerId: randomCustomer._id,
        serviceId: randomService._id,
        bookingDate,
        status: randomStatus,
        notes: `Test reservation for ${randomService.name}`,
      });
      reservations.push(reservation);
      console.log(`✓ Created reservation: ${randomCustomer.name} → ${randomService.name} (${randomStatus})`);
    }

    console.log('\n✅ Seeding complete!\n');
    console.log('Test Credentials:');
    console.log('  Admin: admin@oasisreserve.com / Admin@123456');
    console.log('  Staff: staff@oasisreserve.com / Staff@123456');
    console.log('  Receptionist: receptionist@oasisreserve.com / Receptionist@123456');
    console.log('\nStart the backend with: npm start');
    console.log('Then login at: http://localhost:5173/login');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

connectDB().then(seed);
