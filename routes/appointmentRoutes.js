// routes/appointmentRoutes.js
const express = require('express');
const { createAppointment, getUserAppointments } = require('../controllers/appointmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createAppointment); // Create appointment
router.get('/:userId', authenticateToken, getUserAppointments); // Get user appointments

module.exports = router;