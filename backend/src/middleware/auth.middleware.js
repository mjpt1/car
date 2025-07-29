const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-jwt-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
      }
      return res.status(403).json({ message: 'Forbidden: Token is not valid.' });
    }
    req.user = user; // Add decoded user payload to request object
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: Role not available on token.' });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next(); // User has the required role, proceed
    } else {
      return res.status(403).json({ message: 'Forbidden: You do not have sufficient permissions to access this resource.' });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
