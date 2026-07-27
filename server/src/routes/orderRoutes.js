const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  listOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.use(protect);
router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/', requireRole('admin'), listOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', requireRole('admin'), updateOrderStatus);

module.exports = router;
