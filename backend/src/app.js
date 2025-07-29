const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // For parsing application/json
// Add other global middleware here (e.g., cors, morgan)

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const tripRoutes = require('./modules/trips/trip.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);

// Swagger API documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/', (req, res) => {
  res.send('Backend API is running! Visit /api-docs for documentation.');
});

// Global Error Handler (must be defined after all routes)
// This is a very basic error handler. You might want to use a more sophisticated one.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const http = require('http');
const { Server } = require("socket.io");
const { initializeSocket } = require('./socket/socket.handler');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow requests from your frontend
    methods: ["GET", "POST"]
  }
});

// Initialize Socket.IO logic
initializeSocket(io);

// Make io accessible to our router
app.set('socketio', io);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is listening for connections.`);
});
