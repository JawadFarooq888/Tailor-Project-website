const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { adjustStock, listInventory, listHistory } = require('../controllers/inventoryController');

const router = express.Router();

router.use(protect, requireRole('admin'));
router.get('/', listInventory);
router.get('/history', listHistory);
router.post('/:productId/adjust', adjustStock);

module.exports = router;
