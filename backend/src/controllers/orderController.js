const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc  Place a new order
// @route POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress, paymentMethod, notes } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isOpen) {
    res.status(400);
    throw new Error('Restaurant is not available for orders');
  }

  // Validate and price items
  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of items) {
    const menuItem = await MenuItem.findById(cartItem.menuItemId);
    if (!menuItem || !menuItem.isAvailable || menuItem.restaurant.toString() !== restaurantId) {
      res.status(400);
      throw new Error(`Item "${menuItem?.name || cartItem.menuItemId}" is not available`);
    }
    const price = menuItem.discountedPrice || menuItem.price;
    subtotal += price * cartItem.quantity;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price,
      quantity: cartItem.quantity,
      customizations: cartItem.customizations || [],
      image: menuItem.image,
    });
  }

  if (subtotal < restaurant.minimumOrder) {
    res.status(400);
    throw new Error(`Minimum order amount is ₹${restaurant.minimumOrder}`);
  }

  const deliveryFee = restaurant.deliveryFee;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = subtotal + deliveryFee + tax;

  const estimatedTime = restaurant.deliveryTime.max;
  const estimatedDeliveryTime = new Date(Date.now() + estimatedTime * 60 * 1000);

  const order = await Order.create({
    user: req.user._id,
    restaurant: restaurantId,
    items: orderItems,
    deliveryAddress,
    pricing: { subtotal, deliveryFee, tax, total },
    payment: { method: paymentMethod || 'cod', status: paymentMethod === 'cod' ? 'pending' : 'completed' },
    estimatedDeliveryTime,
    notes,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
    deliveryPerson: {
      name: 'Ravi Kumar',
      phone: '+91 98765 43210',
      vehicleNumber: 'MH 12 AB 3456',
    },
  });

  // Update restaurant stats
  await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { totalOrders: 1 } });

  const populated = await Order.findById(order._id)
    .populate('restaurant', 'name image address')
    .populate('items.menuItem', 'name image');

  res.status(201).json({ success: true, message: 'Order placed successfully', data: populated });
});

// @desc  Get order by ID (owner or user)
// @route GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('restaurant', 'name image address contactPhone')
    .populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow user who placed or restaurant owner
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const restaurant = await Restaurant.findById(order.restaurant._id);
  const isRestaurantOwner = restaurant?.owner.toString() === req.user._id.toString();

  if (!isOwner && !isRestaurantOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc  Get current user's order history
// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate('restaurant', 'name image cuisines')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
});

// @desc  Update order status (restaurant owner)
// @route PATCH /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
  };

  const order = await Order.findById(req.params.id).populate('restaurant');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isRestaurantOwner = order.restaurant.owner.toString() === req.user._id.toString();
  if (!isRestaurantOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!validTransitions[order.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Cannot transition from '${order.status}' to '${status}'`);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.payment.status = 'completed';
    await Restaurant.findByIdAndUpdate(order.restaurant._id, { $inc: { totalRevenue: order.pricing.total } });
  }

  await order.save();
  res.json({ success: true, message: 'Order status updated', data: order });
});

// @desc  Get restaurant's orders
// @route GET /api/orders/restaurant
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { restaurant: restaurant._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate('user', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
});

// @desc  Cancel order
// @route PATCH /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  order.status = 'cancelled';
  order.cancellationReason = req.body.reason || 'Cancelled by user';
  order.statusHistory.push({ status: 'cancelled', note: order.cancellationReason });
  await order.save();

  res.json({ success: true, message: 'Order cancelled', data: order });
});

module.exports = { placeOrder, getOrder, getMyOrders, updateOrderStatus, getRestaurantOrders, cancelOrder };
