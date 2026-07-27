const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { listCustomers, getCustomerDetail, setCustomerActive } = require('../controllers/userController');

const router = express.Router();

router.use(protect, requireRole('admin'));
router.get('/', listCustomers);
router.get('/:id', getCustomerDetail);
router.patch('/:id/active', setCustomerActive);

module.exports = router;
