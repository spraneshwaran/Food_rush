const express = require('express');
const { placeOrder, getOrder, getMyOrders, updateOrderStatus, getRestaurantOrders, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, orderSchema } = require('../middleware/validator');
const { orderRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', protect, authorize('user'), orderRateLimiter, validate(orderSchema), placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/restaurant', protect, authorize('restaurant'), getRestaurantOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorize('restaurant', 'admin'), updateOrderStatus);
router.patch('/:id/cancel', protect, authorize('user'), cancelOrder);

module.exports = router;
