const jwt = require('jsonwebtoken');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function sendTokenCookie(res, userId) {
  const token = signToken(userId);
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    // Frontend (Vercel) and backend (Render/Railway) live on different domains in
    // production, so the auth cookie must be SameSite=None (requires Secure) to be
    // sent on cross-site API calls. Locally, both run on http://localhost, where
    // SameSite=None without Secure is rejected by browsers — so use Lax there instead.
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

module.exports = { signToken, sendTokenCookie };
