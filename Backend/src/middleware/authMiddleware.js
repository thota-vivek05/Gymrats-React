const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/User');
const Trainer = require('../model/Trainer');
const Manager = require('../model/Manager');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gymrats-secret-key');

      req.user = await User.findById(decoded.id).select('-password_hash');
      if (!req.user) {
          req.user = await Trainer.findById(decoded.id).select('-password_hash');
      }

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin_Protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gymrats-secret-key');

      // Check the Manager collection explicitly
      req.user = await Manager.findById(decoded.id).select('-password_hash');

      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        res.status(403);
        throw new Error('Access denied. Admin or Manager role required.');
      }

      if (req.user.isActive === false) {
         res.status(403);
         throw new Error('This account has been deactivated.');
      }

      next();
    } catch (error) {
      console.error('Admin Auth Error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect, admin_Protect };