const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const asyncHandler = require('../utils/asyncHandler');

const adjustStock = asyncHandler(async (req, res) => {
  const { type, quantity, reason, note = '' } = req.body;
  const qty = Number(quantity);

  if (!['in', 'out', 'correction'].includes(type)) {
    res.status(400);
    throw new Error('Invalid adjustment type');
  }
  if (!reason) {
    res.status(400);
    throw new Error('A reason is required');
  }
  if (!Number.isFinite(qty) || qty < 0) {
    res.status(400);
    throw new Error('Quantity must be a non-negative number');
  }

  const existing = await Product.findById(req.params.productId);
  if (!existing) {
    res.status(404);
    throw new Error('Product not found');
  }
  const previousStock = existing.stockQty;

  let product;
  let newStock;

  if (type === 'in') {
    newStock = previousStock + qty;
    product = await Product.findByIdAndUpdate(req.params.productId, { $inc: { stockQty: qty } }, { new: true });
  } else if (type === 'out') {
    if (qty > previousStock) {
      res.status(400);
      throw new Error(`Cannot remove ${qty} units — only ${previousStock} in stock`);
    }
    newStock = previousStock - qty;
    product = await Product.findOneAndUpdate(
      { _id: req.params.productId, stockQty: { $gte: qty } },
      { $inc: { stockQty: -qty } },
      { new: true }
    );
    if (!product) {
      res.status(409);
      throw new Error('Stock changed concurrently — please retry');
    }
  } else {
    newStock = qty;
    product = await Product.findByIdAndUpdate(req.params.productId, { $set: { stockQty: qty } }, { new: true });
  }

  await InventoryLog.create({
    product: product._id,
    type,
    quantityChange: newStock - previousStock,
    previousStock,
    newStock,
    reason,
    note,
    admin: req.user._id,
  });

  res.json(product);
});

const listInventory = asyncHandler(async (req, res) => {
  const { search, stockStatus, page = 1, limit = 30 } = req.query;
  const filter = { status: { $ne: 'archived' } };
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (stockStatus === 'out') filter.stockQty = 0;
  if (stockStatus === 'low') filter.$expr = { $and: [{ $gt: ['$stockQty', 0] }, { $lte: ['$stockQty', '$lowStockThreshold'] }] };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .sort({ stockQty: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

const listHistory = asyncHandler(async (req, res) => {
  const { productId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (productId) filter.product = productId;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    InventoryLog.find(filter)
      .populate('product', 'name sku')
      .populate('admin', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    InventoryLog.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
});

module.exports = { adjustStock, listInventory, listHistory };
