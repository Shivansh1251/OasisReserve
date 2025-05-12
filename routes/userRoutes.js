const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Save the hashed password
            role: role || 'user', // Default role is 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: { name, email, role } });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user', details: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        console.log(`Login attempt with email: ${email}`); // Log the email being searched
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`); // Log if user is not found
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the entered password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Invalid password for email: ${email}`); // Log invalid password attempts
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`Login successful for email: ${email}`); // Log successful login
        res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error during login:', error.message); // Log any unexpected errors
        res.status(500).json({ error: 'Error logging in', details: error.message });
    }
});

// Get logged-in user details
router.get('/user', async (req, res) => {
    try {
        const userId = req.query.mockUserId || req.userId; // Use req.userId if using middleware for authentication

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details', details: error.message });
    }
});

module.exports = router;
