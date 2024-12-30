const express = require('express');
const app = express();
const db = require('./db');
const { authenticateToken } = require('./middleware');

app.get('/user-profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the JWT token

        const query = `
            SELECT username, firstname, lastname, email, phoneNumber, 
                   dateOfBirth, gender
            FROM users 
            WHERE id = ?`;
        
        db.get(query, [userId], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = app; 