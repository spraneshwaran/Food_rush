const express = require('express');
const { getStats, getUsers, toggleUserStatus, getRestaurants, approveRestaurant, getOrders } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/restaurants', getRestaurants);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.get('/orders', getOrders);

module.exports = router;
