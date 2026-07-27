const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenCookie } = require('../utils/token');

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses,
    wishlist: user.wishlist,
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }
  const user = await User.create({ name, email, password, phone, role: 'customer' });
  sendTokenCookie(res, user._id);
  res.status(201).json(publicUser(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }
  sendTokenCookie(res, user._id);
  res.json(publicUser(user));
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase(), role: 'admin' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }
  sendTokenCookie(res, user._id);
  res.json(publicUser(user));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(publicUser(req.user));
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json(publicUser(req.user));
});

const addAddress = asyncHandler(async (req, res) => {
  const address = req.body;
  if (address.isDefault) {
    req.user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  req.user.addresses.push(address);
  await req.user.save();
  res.status(201).json(req.user.addresses);
});

const updateAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.addressId);
  if (!addr) {
    res.status(404);
    throw new Error('Address not found');
  }
  if (req.body.isDefault) {
    req.user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  Object.assign(addr, req.body);
  await req.user.save();
  res.json(req.user.addresses);
});

const deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses.id(req.params.addressId)?.deleteOne();
  await req.user.save();
  res.json(req.user.addresses);
});

module.exports = {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  updateMe,
  addAddress,
  updateAddress,
  deleteAddress,
};
