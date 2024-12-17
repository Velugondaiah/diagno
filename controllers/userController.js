const { initializeDb } = require('../models/db');

// Example function to get user profile
const getUserProfile = async (req, res) => {
    const { userId } = req.params;

    const db = await initializeDb();
    const getUserQuery = `
        SELECT id, username, firstname, lastname, email, phoneNumber, dateOfBirth, gender 
        FROM users WHERE id = ?
    `;

    try {
        const user = await db.get(getUserQuery, [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
    }
};

module.exports = { getUserProfile };
