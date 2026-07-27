const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    size,
    color,
    featured,
    status,
    sort,
    page = 1,
    limit = 12,
    admin,
  } = req.query;

  const filter = {};
  if (admin !== 'true') filter.status = 'active';
  else if (status) filter.status = status;

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (size) filter.sizes = size;
  if (color) filter.colors = color;
  if (featured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    best_selling: { ratingCount: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(60, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

function buildSlugCandidate(name) {
  return `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
}

const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body.name || !body.sku || !body.category || body.price === undefined) {
    res.status(400);
    throw new Error('name, sku, category and price are required');
  }
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const product = await Product.create({
    ...body,
    colors: parseArrayField(body.colors),
    sizes: parseArrayField(body.sizes),
    tags: parseArrayField(body.tags),
    images,
    slug: buildSlugCandidate(body.name),
  });
  res.status(201).json(product);
});

function parseArrayField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const body = req.body;
  const fields = [
    'name',
    'sku',
    'category',
    'subCategory',
    'brand',
    'fabric',
    'price',
    'discountPercent',
    'description',
    'stockQty',
    'lowStockThreshold',
    'status',
    'isFeatured',
    'videoUrl',
  ];
  fields.forEach((f) => {
    if (body[f] !== undefined) product[f] = body[f];
  });
  if (body.colors !== undefined) product.colors = parseArrayField(body.colors);
  if (body.sizes !== undefined) product.sizes = parseArrayField(body.sizes);
  if (body.tags !== undefined) product.tags = parseArrayField(body.tags);
  if (body.name && body.name !== product.name) {
    product.slug = buildSlugCandidate(body.name);
  }
  const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
  if (newImages.length) product.images = [...product.images, ...newImages];
  if (body.removeImages) {
    const toRemove = parseArrayField(body.removeImages);
    product.images = product.images.filter((img) => !toRemove.includes(img));
  }
  await product.save();
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
});

const getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$stockQty', '$lowStockThreshold'] },
    status: { $ne: 'archived' },
  }).sort({ stockQty: 1 });
  res.json(products);
});

module.exports = {
  listProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock,
};
