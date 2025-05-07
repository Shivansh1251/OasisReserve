const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users = []; // Mock database

// ...existing code...

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Simulate database operation (replace with actual DB logic)
        const userExists = users.find(user => user.email === email);
        if (userExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Add user to the mock database
        const newUser = { id: users.length + 1, name, email, password, role };
        users.push(newUser);

        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        console.error('Error in /signup route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ...existing code...

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});