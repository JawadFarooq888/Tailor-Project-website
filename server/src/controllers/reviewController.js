const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

async function recalcProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
}

const listProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('customer', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, images } = req.body;
  const hasPurchased = await Order.exists({
    customer: req.user._id,
    'items.product': productId,
    status: { $in: ['delivered', 'shipped', 'packed', 'processing'] },
  });
  const review = await Review.create({
    product: productId,
    customer: req.user._id,
    rating,
    comment,
    images,
    isApproved: !!hasPurchased,
  });
  if (hasPurchased) await recalcProductRating(productId);
  res.status(201).json(review);
});

const listAllReviews = asyncHandler(async (req, res) => {
  const { approved } = req.query;
  const filter = {};
  if (approved !== undefined) filter.isApproved = approved === 'true';
  const reviews = await Review.find(filter)
    .populate('customer', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.isApproved = true;
  await review.save();
  await recalcProductRating(review.product);
  res.json(review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  await recalcProductRating(review.product);
  res.json({ message: 'Review deleted' });
});

module.exports = { listProductReviews, createReview, listAllReviews, approveReview, deleteReview };
