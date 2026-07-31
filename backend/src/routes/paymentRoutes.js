const express = require('express');
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.post('/verify', protect, verifyPayment);

module.exports = router;
