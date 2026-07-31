const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// @desc  Get platform dashboard stats
// @route GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalRestaurants, totalOrders, revenueResult] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Restaurant.countDocuments({ isApproved: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
  ]);

  const pendingApprovals = await Restaurant.countDocuments({ isApproved: false, isActive: true });
  const activeOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] } });

  // Last 7 days revenue
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyRevenue = await Order.aggregate([
    { $match: { status: 'delivered', createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingApprovals,
      activeOrders,
      weeklyRevenue,
    },
  });
});

// @desc  Get all users
// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  res.json({ success: true, data: users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
});

// @desc  Toggle user active status
// @route PATCH /api/admin/users/:id/toggle
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot deactivate admin accounts');
  }

  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
});

// @desc  Get all restaurants (admin view)
// @route GET /api/admin/restaurants
const getRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isApproved, search } = req.query;
  const filter = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Restaurant.countDocuments(filter);
  const restaurants = await Restaurant.find(filter)
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, data: restaurants, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
});

// @desc  Approve/reject restaurant
// @route PATCH /api/admin/restaurants/:id/approve
const approveRestaurant = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id, { isApproved }, { new: true }
  );
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }
  res.json({ success: true, message: `Restaurant ${isApproved ? 'approved' : 'rejected'}`, data: restaurant });
});

// @desc  Get all orders (admin)
// @route GET /api/admin/orders
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
});

module.exports = { getStats, getUsers, toggleUserStatus, getRestaurants, approveRestaurant, getOrders };
