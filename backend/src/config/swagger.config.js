const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Booking API',
      version: '1.0.0',
      description: 'API documentation for the Car Booking System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // --- General Schemas ---
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            details: { type: 'string', nullable: true },
            errors: { type: 'array', items: { type: 'object' }, nullable: true }
          },
        },
        SuccessMessage: {
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        },
        // --- Other schemas from previous phases...
      }
    },
  },
  apis: [
    './src/modules/auth/auth.routes.js',
    './src/modules/users/user.routes.js',
    './src/modules/drivers/driver.routes.js',
    './src/modules/trips/trip.routes.js',
    './src/modules/bookings/booking.routes.js',
    './src/modules/ratings/rating.routes.js',
    './src/modules/admin/admin.routes.js',
    './src/modules/payments/payment.routes.js',
    './src/modules/transactions/transaction.routes.js',
    './src/modules/articles/article.routes.js',
    './src/modules/categories/category.routes.js',
    './src/modules/tags/tag.routes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
