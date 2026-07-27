const asyncHandler = require('../utils/asyncHandler');

const getWishlist = asyncHandler(async (req, res) => {
  await req.user.populate('wishlist');
  res.json(req.user.wishlist);
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const idx = req.user.wishlist.findIndex((id) => id.toString() === productId);
  if (idx >= 0) {
    req.user.wishlist.splice(idx, 1);
  } else {
    req.user.wishlist.push(productId);
  }
  await req.user.save();
  await req.user.populate('wishlist');
  res.json(req.user.wishlist);
});

module.exports = { getWishlist, toggleWishlist };
