// routes/userRoutes.js
const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:userId', authenticateToken, getUserProfile); // Get user profile

module.exports = router;