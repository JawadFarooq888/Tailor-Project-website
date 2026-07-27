const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

const listCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('-cart -wishlist')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

const getCustomerDetail = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-cart -wishlist');
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
  res.json({ customer, orders });
});

const setCustomerActive = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  customer.isActive = req.body.isActive;
  await customer.save();
  res.json({ message: 'Updated', isActive: customer.isActive });
});

module.exports = { listCustomers, getCustomerDetail, setCustomerActive };
