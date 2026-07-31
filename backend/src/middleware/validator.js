const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
};

// Auth schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['user', 'restaurant']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// Menu item schema
const menuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  price: z.number().positive(),
  discountedPrice: z.number().positive().optional(),
  category: z.string().min(1),
  isVeg: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'hot', 'extra-hot']).optional(),
});

// Order schema
const orderSchema = z.object({
  restaurantId: z.string().length(24, 'Invalid restaurant ID'),
  items: z.array(z.object({
    menuItemId: z.string().length(24),
    quantity: z.number().int().positive(),
    customizations: z.array(z.string()).optional(),
  })).min(1, 'Order must have at least one item'),
  deliveryAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
  paymentMethod: z.enum(['card', 'upi', 'cod', 'wallet']).default('cod'),
  notes: z.string().max(200).optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  menuItemSchema,
  orderSchema,
};
