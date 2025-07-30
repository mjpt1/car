const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security Middlewares ---
app.use(helmet()); // Set various security HTTP headers
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' })); // Enable CORS

// Rate limiting for sensitive endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});


// --- Standard Middlewares ---
app.use(express.json()); // For parsing application/json

// --- Route Imports ---
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const tripRoutes = require('./modules/trips/trip.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const ratingRoutes = require('./modules/ratings/rating.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const transactionRoutes = require('./modules/transactions/transaction.routes');
const { publicRoutes: articlePublicRoutes, adminRoutes: articleAdminRoutes } = require('./modules/articles/article.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const tagRoutes = require('./modules/tags/tag.routes');
const seoRoutes = require('./modules/seo.routes');

// --- Swagger UI ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

// --- Socket.IO ---
const http = require('http');
const { Server } = require("socket.io");
const { initializeSocket } = require('./socket/socket.handler');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

initializeSocket(io);
app.set('socketio', io);

// --- Route Mounting ---
app.use('/', seoRoutes); // SEO routes at root

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter, authRoutes);

// Other API routes
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/articles', articlePublicRoutes);
app.use('/api/admin/articles', articleAdminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api', (req, res) => {
  res.send('Backend API is running! Visit /api-docs for documentation.');
});

// --- Improved Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Default error response
  const errorResponse = {
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Show stack in dev mode
  };

  // You can check for specific error types here if needed
  // For example, if (err instanceof MyCustomError) { ... }

  res.status(err.statusCode || 500).json(errorResponse);
});

// --- Server Listening ---
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is listening for connections.`);
});
