const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokens');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function formatUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

function issueTokens(user) {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
    };
}

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        // Force public signups to be customers only. Admins should create staff via the admin-only endpoint.
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Save the hashed password
            role: 'customer',
        });

        const savedUser = await newUser.save();
        const accessToken = generateAccessToken(savedUser);
        const refreshToken = generateRefreshToken(savedUser);
        res.status(201).json({
            message: 'User registered successfully',
            user: savedUser.toJSON(),
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Signup error:', error);
        // Provide clearer error messages for common cases
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to register user' });
    }
});

// Admin-only: create a user (staff/admin) with specified role
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User created', user: savedUser.toJSON() });
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: 'Failed to create user' });
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

        user.tokenVersion = user.tokenVersion || 0;
        await user.save();

        console.log(`Login successful for email: ${email}`); // Log successful login
        res.status(200).json({ message: 'Login successful', user: formatUser(user), tokens: issueTokens(user) });
    } catch (error) {
        console.error('Error during login:', error.message); // Log any unexpected errors
        res.status(500).json({ error: 'Error logging in', details: error.message });
    }
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const payload = verifyRefreshToken(refreshToken);
        const user = await User.findById(payload.sub);

        if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
            return res.status(401).json({ error: 'Session expired' });
        }

        res.status(200).json({ user: formatUser(user), tokens: issueTokens(user) });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

router.post('/logout', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log out', details: error.message });
    }
});

// Get logged-in user details
router.get('/me', requireAuth, async (req, res) => {
    try {
        res.status(200).json({ user: formatUser(req.user) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details', details: error.message });
    }
});

// Admin-only: list all users (id, name, email, role)

router.get('/', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const users = await User.find({}, 'name email role');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

module.exports = router;
