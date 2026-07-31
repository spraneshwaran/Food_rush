const express = require('express');
const { register, login, refreshToken, getProfile, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema } = require('../middleware/validator');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
