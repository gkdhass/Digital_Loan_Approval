const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user via JWT
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired, please log in again',
        errorCode: 'TOKEN_EXPIRED',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token, please log in again',
        errorCode: 'TOKEN_INVALID',
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      errorCode: 'AUTH_FAILED',
    });
  }
};

// Authorize based on roles
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRole };
