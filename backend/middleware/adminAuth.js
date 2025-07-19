const { authMiddleware } = require('./auth');

const adminAuthMiddleware = (req, res, next) => {
  // First, run the standard authentication middleware
  authMiddleware(req, res, () => {
    // Then, check if the user's role is 'admin'
    if (req.user && req.user.role === 'admin') {
      next(); // User is an admin, proceed
    } else {
      res.status(403).json({ error: 'Forbidden: Admins only' });
    }
  });
};

module.exports = { adminAuthMiddleware };