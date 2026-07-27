const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const REVENUE_STATUSES = ['processing', 'packed', 'shipped', 'delivered'];

const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    revenueAgg,
    monthlyRevenueAgg,
    monthlySalesAgg,
    customersCount,
    lowStockProducts,
    outOfStockCount,
    recentOrders,
    bestSellers,
  ] = await Promise.all([
    Order.countDocuments({}),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'delivered' }),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.countDocuments({ role: 'customer' }),
    Product.find({ $expr: { $lte: ['$stockQty', '$lowStockThreshold'] }, status: { $ne: 'archived' } })
      .sort({ stockQty: 1 })
      .limit(10),
    Product.countDocuments({ stockQty: 0, status: { $ne: 'archived' } }),
    Order.find({}).populate('customer', 'name email').sort({ createdAt: -1 }).limit(8),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    completedOrders,
    revenue: revenueAgg[0]?.total || 0,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    monthlySales: monthlySalesAgg.map((m) => ({
      label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      total: m.total,
      orders: m.orders,
    })),
    customersCount,
    lowStockProducts,
    lowStockCount: lowStockProducts.length,
    outOfStockCount,
    recentOrders,
    bestSellers,
  });
});

module.exports = { getDashboardStats };
