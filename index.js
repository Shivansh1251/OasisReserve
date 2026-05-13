const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db.config');
const cors = require('cors');

const customerRoutes = require('./routes/customerRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./Backend/routes/userRoutes');
const dashboardRoutes = require('./Backend/routes/dashboardRoutes');

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://oasis-reserve.vercel.app',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000; // Add fallback port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// const predefinedServices = [
//   { name: 'Hair Spa', price: 50 },
//   { name: 'Manicure', price: 30 },
//   { name: 'Pedicure', price: 40 },
// ];

// const populateServices = async () => {
//   try {
//     const existingServices = await Service.find();
//     if (existingServices.length === 0) {
//       await Service.insertMany(predefinedServices);
//       console.log('Predefined services added.');
//     }
//   } catch (err) {
//     console.error('Error populating services:', err.message);
//   }
// };

// populateServices();
