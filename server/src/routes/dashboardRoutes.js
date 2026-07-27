const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', protect, requireRole('admin'), getDashboardStats);

module.exports = router;
