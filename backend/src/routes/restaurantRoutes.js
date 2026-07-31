const express = require('express');
const {
  getRestaurants, getRestaurant, getFeaturedRestaurants, getCuisines,
  getMyRestaurant, createRestaurant, updateRestaurant, getAnalytics
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
router.get('/featured', getFeaturedRestaurants);
router.get('/cuisines', getCuisines);
router.get('/:id', getRestaurant);

// Restaurant owner routes
router.get('/owner/my', protect, authorize('restaurant'), getMyRestaurant);
router.post('/', protect, authorize('restaurant'), createRestaurant);
router.put('/:id', protect, authorize('restaurant'), updateRestaurant);
router.get('/:id/analytics', protect, authorize('restaurant', 'admin'), getAnalytics);

module.exports = router;
