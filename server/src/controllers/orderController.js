const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TB-${stamp}-${rand}`;
}

const STOCK_RESTORING_STATUSES = ['cancelled', 'refunded'];

// Deducts stock atomically per-product (no multi-document transaction, so this
// works on a plain standalone MongoDB instance, not just a replica set).
// If a later line item fails, already-deducted lines are rolled back.
async function reserveStock(items) {
  const reserved = [];
  try {
    for (const line of items) {
      const product = await Product.findOneAndUpdate(
        { _id: line.productId, stockQty: { $gte: line.quantity } },
        { $inc: { stockQty: -line.quantity } },
        { new: true }
      );
      if (!product) {
        const existing = await Product.findById(line.productId);
        if (!existing) throw new Error(`Product ${line.productId} not found`);
        throw new Error(`Insufficient stock for ${existing.name} (available: ${existing.stockQty})`);
      }
      reserved.push({ productId: line.productId, quantity: line.quantity });
      line._product = product;
    }
    return items;
  } catch (err) {
    for (const r of reserved) {
      await Product.findByIdAndUpdate(r.productId, { $inc: { stockQty: r.quantity } });
    }
    throw err;
  }
}

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod', shippingFee = 0 } = req.body;
  if (!items || !items.length) {
    res.status(400);
    throw new Error('Order must contain at least one item');
  }
  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  const reservedItems = await reserveStock(items);

  const orderItems = reservedItems.map((line) => ({
    product: line._product._id,
    name: line._product.name,
    image: line._product.images[0] || '',
    price: line._product.salePrice,
    quantity: line.quantity,
    size: line.size || '',
    color: line.color || '',
  }));
  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = itemsTotal + Number(shippingFee || 0);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingFee,
    grandTotal,
    status: 'pending',
    statusHistory: [{ status: 'pending' }],
  });

  req.user.cart = [];
  await req.user.save();

  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = order.customer._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json(order);
});

const listOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const shouldRestoreStock = STOCK_RESTORING_STATUSES.includes(status) && !order.stockRestored;
  if (shouldRestoreStock) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQty: item.quantity } });
    }
    order.stockRestored = true;
    if (status === 'refunded') order.paymentStatus = 'unpaid';
  }

  if (status === 'delivered' && order.paymentMethod === 'cod') order.paymentStatus = 'paid';

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();

  res.json(order);
});

module.exports = { createOrder, getMyOrders, getOrderById, listOrders, updateOrderStatus };
