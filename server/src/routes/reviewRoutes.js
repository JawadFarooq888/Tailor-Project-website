const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const {
  listProductReviews,
  createReview,
  listAllReviews,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/product/:productId', listProductReviews);
router.post('/', protect, createReview);
router.get('/', protect, requireRole('admin'), listAllReviews);
router.patch('/:id/approve', protect, requireRole('admin'), approveReview);
router.delete('/:id', protect, requireRole('admin'), deleteReview);

module.exports = router;
