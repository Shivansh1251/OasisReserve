const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'oasisreserve-access-secret';
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'oasisreserve-refresh-secret';

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    },
    accessTokenSecret,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
    },
    refreshTokenSecret,
    { expiresIn: '7d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};