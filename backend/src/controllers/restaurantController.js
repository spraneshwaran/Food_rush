const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc  Get all approved restaurants with search/filter/pagination
// @route GET /api/restaurants
const getRestaurants = asyncHandler(async (req, res) => {
  const {
    search, cuisine, city, minRating, maxDeliveryFee,
    sort = 'rating', page = 1, limit = 12, isOpen
  } = req.query;

  const query = { isApproved: true, isActive: true };

  if (search) query.$text = { $search: search };
  if (cuisine) query.cuisines = { $in: cuisine.split(',') };
  if (city) query['address.city'] = { $regex: city, $options: 'i' };
  if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };
  if (maxDeliveryFee) query.deliveryFee = { $lte: parseInt(maxDeliveryFee) };
  if (isOpen !== undefined) query.isOpen = isOpen === 'true';

  const sortMap = {
    rating: { 'rating.average': -1 },
    deliveryTime: { 'deliveryTime.min': 1 },
    price: { priceForTwo: 1 },
    popular: { totalOrders: -1 },
    newest: { createdAt: -1 },
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Restaurant.countDocuments(query);

  const restaurants = await Restaurant.find(query)
    .select('-totalRevenue -__v')
    .sort(sortMap[sort] || { 'rating.average': -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('owner', 'name email');

  res.json({
    success: true,
    data: restaurants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc  Get single restaurant
// @route GET /api/restaurants/:id
const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');

  if (!restaurant || !restaurant.isActive) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Attach grouped menu
  const menu = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });
  const menuByCategory = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({ success: true, data: { restaurant, menu: menuByCategory } });
});

// @desc  Get featured restaurants (high rating + open)
// @route GET /api/restaurants/featured
const getFeaturedRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    isApproved: true, isActive: true, isOpen: true, 'rating.average': { $gte: 4 }
  })
    .sort({ 'rating.average': -1, totalOrders: -1 })
    .limit(8)
    .select('name image cuisines rating deliveryTime deliveryFee priceForTwo address');

  res.json({ success: true, data: restaurants });
});

// @desc  Get unique cuisines
// @route GET /api/restaurants/cuisines
const getCuisines = asyncHandler(async (req, res) => {
  const cuisines = await Restaurant.distinct('cuisines', { isApproved: true, isActive: true });
  res.json({ success: true, data: cuisines.sort() });
});

// @desc  Owner: Get own restaurant
// @route GET /api/restaurants/my
const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    res.status(404);
    throw new Error('You do not have a restaurant registered');
  }
  res.json({ success: true, data: restaurant });
});

// @desc  Owner: Create restaurant
// @route POST /api/restaurants
const createRestaurant = asyncHandler(async (req, res) => {
  const existing = await Restaurant.findOne({ owner: req.user._id });
  if (existing) {
    res.status(409);
    throw new Error('You already have a registered restaurant');
  }

  const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, message: 'Restaurant created, awaiting approval', data: restaurant });
});

// @desc  Owner: Update restaurant
// @route PUT /api/restaurants/:id
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found or unauthorized');
  }

  const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, message: 'Restaurant updated', data: updated });
});

// @desc  Owner: Get dashboard analytics
// @route GET /api/restaurants/:id/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found or unauthorized');
  }

  const Order = require('../models/Order');
  const [total, pending, delivered, revenue] = await Promise.all([
    Order.countDocuments({ restaurant: restaurant._id }),
    Order.countDocuments({ restaurant: restaurant._id, status: 'pending' }),
    Order.countDocuments({ restaurant: restaurant._id, status: 'delivered' }),
    Order.aggregate([
      { $match: { restaurant: restaurant._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders: total,
      pendingOrders: pending,
      deliveredOrders: delivered,
      totalRevenue: revenue[0]?.total || 0,
      rating: restaurant.rating,
    },
  });
});

module.exports = {
  getRestaurants, getRestaurant, getFeaturedRestaurants,
  getCuisines, getMyRestaurant, createRestaurant, updateRestaurant, getAnalytics
};
