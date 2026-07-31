const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!req.user || !req.user.isActive) {
      res.status(401);
      throw new Error('User account is inactive or not found');
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized — invalid or expired token');
  }
});

// Role-based access control factory
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not authorized to access this resource`);
  }
  next();
};

module.exports = { protect, authorize };
