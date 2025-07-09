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

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // For user profile (e.g., /api/users/profile)
app.use('/api/drivers', driverRoutes); // For driver specific actions (e.g., /api/drivers/apply, /api/drivers/documents/upload)

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
