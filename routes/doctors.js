const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Your database connection

router.get('/api/doctors', async (req, res) => {
    try {
        const { location, specialization } = req.query;
        
        const query = `
            SELECT * FROM doctor 
            WHERE location = ? 
            AND specialization = ? 
            AND status = 'active'
        `;
        
        const [doctors] = await db.execute(query, [location, specialization]);
        
        if (doctors.length === 0) {
            return res.json({ 
                success: false, 
                message: 'No doctors available in this location for the selected specialization' 
            });
        }
        
        res.json({ 
            success: true, 
            doctors: doctors 
        });
        
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching doctor details' 
        });
    }
});

module.exports = router; 