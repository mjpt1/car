const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // For parsing application/json

// Route Imports
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


// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

// Socket.IO
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

// Initialize Socket.IO logic
initializeSocket(io);

// Make io accessible to our router
app.set('socketio', io);

// Mount SEO routes at the root
app.use('/', seoRoutes);

// Mount API routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Content Management Routes
app.use('/api/articles', articlePublicRoutes);
app.use('/api/admin/articles', articleAdminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);

// Swagger API documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/api', (req, res) => { // A simple root for API
  res.send('Backend API is running! Visit /api-docs for documentation.');
});

// Global Error Handler (must be defined after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is listening for connections.`);
});
