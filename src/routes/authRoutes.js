const express = require('express');
const router = express.Router();
// Import fungsi baru
const { register, login, googleAuth, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// ROUTE BARU
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); // Pakai parameter :token

module.exports = router;