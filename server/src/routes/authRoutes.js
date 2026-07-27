const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  updateMe,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/me/addresses', protect, addAddress);
router.patch('/me/addresses/:addressId', protect, updateAddress);
router.delete('/me/addresses/:addressId', protect, deleteAddress);

module.exports = router;
