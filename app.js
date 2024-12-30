const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // your MySQL username
    password: '',  // your MySQL password
    database: 'your_database_name'
});

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

// Doctor search endpoint
app.get('/getDoctors', (req, res) => {
    const { location, specialization } = req.query;
    
    console.log('Received request with:', { location, specialization }); // Debug log

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

        console.log('Query results:', results); // Debug log

        res.json({
            success: true,
            doctors: results
        });
    });
});

// Add this new endpoint for user profile
app.get('/user-profile', (req, res) => {
    // Get the user ID from the JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    // You'll need to implement JWT verification here
    // For now, let's assume we have the user_id
    
    const query = `
        SELECT id, username, firstname, lastname, email, 
               phone_number as phoneNumber, date_of_birth as dateOfBirth, 
               gender 
        FROM users 
        WHERE id = ?
    `;

    db.query(query, [1], (error, results) => {  // Replace 1 with actual user_id from token
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: 'Database error occurred'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json(results[0]);
    });
});

const PORT = 3008;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 