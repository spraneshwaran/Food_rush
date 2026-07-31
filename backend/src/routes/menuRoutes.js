const express = require('express');
const { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:restaurantId', getMenu);
router.get('/item/:id', getMenuItem);
router.post('/', protect, authorize('restaurant'), createMenuItem);
router.put('/:id', protect, authorize('restaurant'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('restaurant'), toggleAvailability);

module.exports = router;
