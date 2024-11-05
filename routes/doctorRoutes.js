const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name'
});

router.get('/getDoctors', (req, res) => {
    const { location, specialization } = req.query;
    
    const query = `
        SELECT * FROM doctors 
        WHERE location = ? 
        AND specialization = ?
    `;

    db.query(query, [location, specialization], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: 'Database error occurred'
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                doctors: []
            });
        }

        res.json({
            success: true,
            doctors: results
        });
    });
});

module.exports = router; 