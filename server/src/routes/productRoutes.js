const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  listProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', listProducts);
router.get('/low-stock', protect, requireRole('admin'), getLowStock);
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', protect, requireRole('admin'), upload.array('images', 8), createProduct);
router.patch('/:id', protect, requireRole('admin'), upload.array('images', 8), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

module.exports = router;
