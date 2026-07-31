const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc  Get menu for a restaurant
// @route GET /api/menu/:restaurantId
const getMenu = asyncHandler(async (req, res) => {
  const { category, isVeg, search } = req.query;
  const filter = { restaurant: req.params.restaurantId };

  if (category) filter.category = category;
  if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
  if (search) filter.$text = { $search: search };

  const items = await MenuItem.find(filter).sort({ isBestseller: -1, orderCount: -1 });

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({ success: true, data: grouped, total: items.length });
});

// @desc  Get single menu item
// @route GET /api/menu/item/:id
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('restaurant', 'name image');
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  res.json({ success: true, data: item });
});

// @desc  Create menu item (restaurant owner)
// @route POST /api/menu
const createMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    res.status(404);
    throw new Error('You do not have a restaurant');
  }

  const item = await MenuItem.create({ ...req.body, restaurant: restaurant._id });
  res.status(201).json({ success: true, message: 'Menu item created', data: item });
});

// @desc  Update menu item (restaurant owner)
// @route PUT /api/menu/:id
const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  const item = await MenuItem.findOne({ _id: req.params.id, restaurant: restaurant?._id });

  if (!item) {
    res.status(404);
    throw new Error('Menu item not found or unauthorized');
  }

  const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, message: 'Menu item updated', data: updated });
});

// @desc  Delete menu item (restaurant owner)
// @route DELETE /api/menu/:id
const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  const item = await MenuItem.findOne({ _id: req.params.id, restaurant: restaurant?._id });

  if (!item) {
    res.status(404);
    throw new Error('Menu item not found or unauthorized');
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Menu item deleted' });
});

// @desc  Toggle item availability
// @route PATCH /api/menu/:id/toggle
const toggleAvailability = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  const item = await MenuItem.findOne({ _id: req.params.id, restaurant: restaurant?._id });

  if (!item) {
    res.status(404);
    throw new Error('Menu item not found or unauthorized');
  }

  item.isAvailable = !item.isAvailable;
  await item.save();
  res.json({ success: true, message: `Item ${item.isAvailable ? 'enabled' : 'disabled'}`, data: item });
});

module.exports = { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability };
