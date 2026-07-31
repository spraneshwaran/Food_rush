require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const connectDB = require('../config/db');

const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Pizza', 'Burgers', 'Biryani', 'Desserts', 'Healthy'];

const RESTAURANTS_DATA = [
  {
    name: 'Spice Garden',
    description: 'Authentic North Indian flavors crafted with love and traditional recipes',
    cuisines: ['North Indian', 'Biryani'],
    address: { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    rating: { average: 4.5, count: 1240 },
    priceForTwo: 450, deliveryTime: { min: 25, max: 40 }, deliveryFee: 30,
    isOpen: true, isApproved: true, totalOrders: 3500,
  },
  {
    name: 'Dragon Palace',
    description: 'Authentic Chinese cuisine with a modern twist. Wok-tossed to perfection.',
    cuisines: ['Chinese'],
    address: { street: '45 FC Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
    rating: { average: 4.2, count: 890 },
    priceForTwo: 350, deliveryTime: { min: 20, max: 35 }, deliveryFee: 25,
    isOpen: true, isApproved: true, totalOrders: 2100,
  },
  {
    name: 'Pizza Republic',
    description: 'Wood-fired artisan pizzas with premium toppings and fresh dough',
    cuisines: ['Pizza'],
    address: { street: '78 Linking Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400003' },
    rating: { average: 4.7, count: 2100 },
    priceForTwo: 600, deliveryTime: { min: 30, max: 45 }, deliveryFee: 40,
    isOpen: true, isApproved: true, totalOrders: 5800,
  },
  {
    name: 'Biryani House',
    description: 'Slow-cooked dum biryani with aromatic spices and tender meat',
    cuisines: ['Biryani', 'North Indian'],
    address: { street: '22 Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400004' },
    rating: { average: 4.8, count: 3400 },
    priceForTwo: 500, deliveryTime: { min: 35, max: 50 }, deliveryFee: 30,
    isOpen: true, isApproved: true, totalOrders: 8900,
  },
  {
    name: 'Burger Station',
    description: 'Gourmet burgers with hand-ground patties and artisan brioche buns',
    cuisines: ['Burgers'],
    address: { street: '55 Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400005' },
    rating: { average: 4.3, count: 1560 },
    priceForTwo: 400, deliveryTime: { min: 20, max: 30 }, deliveryFee: 20,
    isOpen: true, isApproved: true, totalOrders: 4200,
  },
  {
    name: 'The Healthy Bowl',
    description: 'Nutritious, delicious bowls crafted for mindful eating',
    cuisines: ['Healthy', 'South Indian'],
    address: { street: '33 Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400006' },
    rating: { average: 4.1, count: 780 },
    priceForTwo: 380, deliveryTime: { min: 25, max: 40 }, deliveryFee: 35,
    isOpen: true, isApproved: true, totalOrders: 1900,
  },
];

const MENU_BY_RESTAURANT = {
  'Spice Garden': [
    { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 320, category: 'Main Course', isVeg: false, isBestseller: true },
    { name: 'Paneer Tikka Masala', description: 'Grilled paneer in spiced tomato gravy', price: 280, category: 'Main Course', isVeg: true, isBestseller: true },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 220, category: 'Main Course', isVeg: true },
    { name: 'Garlic Naan', description: 'Tandoor-baked bread with garlic and butter', price: 60, category: 'Breads', isVeg: true },
    { name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with spiced chicken', price: 380, category: 'Rice', isVeg: false, isBestseller: true },
    { name: 'Mango Lassi', description: 'Chilled yogurt drink with fresh Alphonso mango', price: 120, category: 'Beverages', isVeg: true },
  ],
  'Dragon Palace': [
    { name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 290, category: 'Main Course', isVeg: false, isBestseller: true },
    { name: 'Veg Fried Rice', description: 'Wok-tossed rice with mixed vegetables', price: 180, category: 'Rice', isVeg: true },
    { name: 'Hot & Sour Soup', description: 'Classic Chinese soup with mushrooms and tofu', price: 150, category: 'Soups', isVeg: true },
    { name: 'Chicken Dim Sum', description: 'Steamed dumplings with chicken filling', price: 220, category: 'Starters', isVeg: false, isBestseller: true },
    { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy sauce', price: 190, category: 'Noodles', isVeg: true },
  ],
  'Pizza Republic': [
    { name: 'Margherita Classic', description: 'San Marzano tomato, fresh mozzarella, basil', price: 380, category: 'Pizzas', isVeg: true, isBestseller: true },
    { name: 'BBQ Chicken Pizza', description: 'BBQ sauce, grilled chicken, red onion, cheddar', price: 480, category: 'Pizzas', isVeg: false, isBestseller: true },
    { name: 'Pepperoni Feast', description: 'Double pepperoni with mozzarella and oregano', price: 520, category: 'Pizzas', isVeg: false },
    { name: 'Garden Fresh', description: 'Bell peppers, olives, mushrooms, cherry tomatoes', price: 420, category: 'Pizzas', isVeg: true },
    { name: 'Cheese Garlic Bread', description: 'Toasted with herb butter and melted mozzarella', price: 160, category: 'Sides', isVeg: true },
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso and mascarpone', price: 220, category: 'Desserts', isVeg: true },
  ],
  'Biryani House': [
    { name: 'Hyderabadi Chicken Biryani', description: 'The original dum biryani with saffron', price: 420, category: 'Biryani', isVeg: false, isBestseller: true },
    { name: 'Vegetable Biryani', description: 'Royal biryani with fresh vegetables and saffron', price: 320, category: 'Biryani', isVeg: true, isBestseller: true },
    { name: 'Mutton Biryani', description: 'Slow-cooked mutton dum biryani', price: 520, category: 'Biryani', isVeg: false },
    { name: 'Mirchi Ka Salan', description: 'Green chili curry accompaniment', price: 120, category: 'Sides', isVeg: true },
    { name: 'Raita', description: 'Chilled yogurt with cucumber and mint', price: 80, category: 'Sides', isVeg: true },
  ],
  'Burger Station': [
    { name: 'Classic Smash Burger', description: 'Double smash patty, special sauce, pickles', price: 320, category: 'Burgers', isVeg: false, isBestseller: true },
    { name: 'Crispy Chicken Burger', description: 'Fried chicken thigh, slaw, honey mustard', price: 280, category: 'Burgers', isVeg: false, isBestseller: true },
    { name: 'Veggie Burger Deluxe', description: 'Black bean patty, avocado, tomato salsa', price: 260, category: 'Burgers', isVeg: true },
    { name: 'Loaded Fries', description: 'Crispy fries topped with cheese sauce and jalapeños', price: 180, category: 'Sides', isVeg: true },
    { name: 'Oreo Milkshake', description: 'Thick shake blended with Oreo cookies', price: 160, category: 'Shakes', isVeg: true },
  ],
  'The Healthy Bowl': [
    { name: 'Quinoa Buddha Bowl', description: 'Quinoa, roasted veggies, tahini dressing', price: 350, category: 'Bowls', isVeg: true, isBestseller: true },
    { name: 'Grilled Chicken Salad', description: 'Mixed greens, grilled chicken, feta, balsamic', price: 380, category: 'Salads', isVeg: false },
    { name: 'Acai Smoothie Bowl', description: 'Acai blend topped with granola and fresh fruits', price: 280, category: 'Bowls', isVeg: true },
    { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil stew and chutney', price: 180, category: 'South Indian', isVeg: true, isBestseller: true },
  ],
};

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await Promise.all([User.deleteMany(), Restaurant.deleteMany(), MenuItem.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'FoodRush Admin', email: 'admin@foodrush.com',
    password: 'Admin@123', role: 'admin', phone: '+91 98000 00001',
  });

  // Create restaurant owners and restaurants
  for (let i = 0; i < RESTAURANTS_DATA.length; i++) {
    const restData = RESTAURANTS_DATA[i];
    const ownerName = restData.name.split(' ')[0] + ' Owner';
    const ownerEmail = restData.name.toLowerCase().replace(/\s+/g, '') + '@foodrush.com';

    const owner = await User.create({
      name: ownerName, email: ownerEmail,
      password: 'Owner@123', role: 'restaurant', phone: `+91 9800000${i + 10}`,
    });

    const restaurant = await Restaurant.create({ ...restData, owner: owner._id });

    const menuItems = MENU_BY_RESTAURANT[restData.name] || [];
    await MenuItem.insertMany(menuItems.map(item => ({ ...item, restaurant: restaurant._id })));
    console.log(`✅ Created restaurant: ${restData.name} with ${menuItems.length} menu items`);
  }

  // Create sample user
  await User.create({
    name: 'Pranesh Kumar', email: 'user@foodrush.com',
    password: 'User@123', role: 'user', phone: '+91 98765 43210',
  });

  console.log('\n🎉 Seed complete!');
  console.log('━'.repeat(50));
  console.log('👤 Admin:      admin@foodrush.com  / Admin@123');
  console.log('🍽  Restaurant: spicegarden@foodrush.com / Owner@123');
  console.log('👤 User:       user@foodrush.com   / User@123');
  console.log('━'.repeat(50));

  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
