const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

async function populatedCart(user) {
  await user.populate('cart.product');
  return user.cart.filter((item) => item.product);
}

const getCart = asyncHandler(async (req, res) => {
  res.json(await populatedCart(req.user));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const existing = req.user.cart.find(
    (item) => item.product.toString() === productId && item.size === size && item.color === color
  );
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    req.user.cart.push({ product: productId, quantity: Number(quantity), size, color });
  }
  await req.user.save();
  res.status(201).json(await populatedCart(req.user));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const item = req.user.cart.find((i) => i.product.toString() === req.params.productId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }
  if (quantity <= 0) {
    req.user.cart = req.user.cart.filter((i) => i !== item);
  } else {
    item.quantity = quantity;
  }
  await req.user.save();
  res.json(await populatedCart(req.user));
});

const removeCartItem = asyncHandler(async (req, res) => {
  req.user.cart = req.user.cart.filter((i) => i.product.toString() !== req.params.productId);
  await req.user.save();
  res.json(await populatedCart(req.user));
});

const clearCart = asyncHandler(async (req, res) => {
  req.user.cart = [];
  await req.user.save();
  res.json([]);
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
