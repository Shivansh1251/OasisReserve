const User = require('../models/User');
const { verifyAccessToken } = require('../utils/tokens');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password');

    if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(allowedRoles = []) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};