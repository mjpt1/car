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

// Optional: Middleware to check for specific roles if you implement them later
// const authorizeRole = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
//     }
//     next();
//   };
// };

module.exports = {
  authenticateToken,
  // authorizeRole,
};
