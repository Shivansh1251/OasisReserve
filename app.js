const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db.config');
const cors = require('cors');
const bodyParser = require('body-parser');

const customerRoutes = require('./routes/customerRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Dashboard.html'));
});

// Use routes
app.use('/customers', customerRoutes);
app.use('/reservations', reservationRoutes);
app.use('/services', serviceRoutes);
app.use('/api/users', userRoutes); // Use user routes for signup and login

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
