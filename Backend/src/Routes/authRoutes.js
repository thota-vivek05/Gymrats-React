// Routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Protected route example
router.get('/profile', authController.verifyToken, authController.getProfile);

module.exports = router;