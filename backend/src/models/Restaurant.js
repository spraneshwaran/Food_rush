const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  cuisines: [{
    type: String,
    trim: true,
  }],
  image: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  contactPhone: String,
  contactEmail: String,
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  priceForTwo: {
    type: Number,
    default: 300,
  },
  deliveryTime: {
    min: { type: Number, default: 20 },
    max: { type: Number, default: 40 },
  },
  deliveryFee: {
    type: Number,
    default: 30,
  },
  minimumOrder: {
    type: Number,
    default: 99,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  openingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean },
  },
  tags: [String],
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ cuisines: 1 });
restaurantSchema.index({ 'rating.average': -1 });
restaurantSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
