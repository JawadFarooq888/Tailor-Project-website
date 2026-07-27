const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('User no longer exists or is inactive');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Not authorized for this action'));
    }
    next();
  };
}

module.exports = { protect, requireRole };
