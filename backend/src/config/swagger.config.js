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
        // url: 'http://www.example.com/support', // Optional
        // email: 'support@example.com', // Optional
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api`,
        description: 'Development server',
      },
      // You can add more servers here (e.g., staging, production)
    ],
    components: {
      securitySchemes: {
        bearerAuth: { // Arbitrary name for the security scheme
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional, for documentation purposes
        },
      },
      schemas: {
        // --- General Schemas ---
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message description.' },
            details: { type: 'string', example: 'Optional error details.', nullable: true },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  path: { type: 'array', items: { type: 'string' } }
                }
              },
              nullable: true,
              description: "Used for validation errors from Zod"
            }
          },
        },
        SuccessMessage: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Operation was successful.'}
            }
        },

        // --- Auth Schemas ---
        UserMinimal: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                phone_number: { type: 'string', example: '09123456789' },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        AuthToken: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            }
        },
        LoginRequest: {
          type: 'object',
          required: ['phone_number', 'password'],
          properties: {
            phone_number: { type: 'string', example: '09123456789' },
            password: { type: 'string', format: 'password', example: 'yourpassword' },
          },
        },
        LoginResponse: {
            allOf: [
                { $ref: '#/components/schemas/SuccessMessage' },
                { $ref: '#/components/schemas/AuthToken' },
                { type: 'object', properties: { user: { $ref: '#/components/schemas/UserMinimal' } } }
            ]
        },
        RequestOtpBody: {
            type: 'object',
            required: ['phone_number'],
            properties: {
                phone_number: { type: 'string', example: '09123456789' }
            }
        },
        RequestOtpResponse: { // For testing, includes OTP
            allOf: [
                { $ref: '#/components/schemas/SuccessMessage' },
                { type: 'object', properties: { otp: { type: 'string', example: '123456'} } }
            ]
        },
        VerifyOtpRegisterRequest: {
            type: 'object',
            required: ['phone_number', 'otp', 'password'],
            properties: {
                phone_number: { type: 'string', example: '09123456789' },
                otp: { type: 'string', example: '123456', minLength: 6, maxLength: 6 },
                password: { type: 'string', format: 'password', example: 'newSecurePassword!', minLength: 8 }
            }
        },
        VerifyOtpRegisterResponse: {
            allOf: [
                { $ref: '#/components/schemas/SuccessMessage' },
                { type: 'object', properties: { user: { $ref: '#/components/schemas/UserMinimal' } } }
            ]
        },
        ForgotPasswordVerifyOtpRequest: {
            type: 'object',
            required: ['phone_number', 'otp'],
            properties: {
                phone_number: { type: 'string', example: '09123456789' },
                otp: { type: 'string', example: '123456' }
            }
        },
        ResetPasswordRequest: {
            type: 'object',
            required: ['phone_number', 'otp', 'new_password'],
            properties: {
                phone_number: { type: 'string', example: '09123456789' },
                otp: { type: 'string', example: '123456' },
                new_password: { type: 'string', format: 'password', example: 'newSecurePassword!', minLength: 8 }
            }
        },

        // --- User Profile Schemas ---
        UserProfile: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                phone_number: { type: 'string', example: '09123456789' },
                first_name: { type: 'string', nullable: true, example: 'John' },
                last_name: { type: 'string', nullable: true, example: 'Doe' },
                email: { type: 'string', format: 'email', nullable: true, example: 'john.doe@example.com' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        },
        UpdateUserProfileRequest: {
            type: 'object',
            properties: {
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' },
                email: { type: 'string', format: 'email', example: 'john.doe@example.com' }
            },
            minProperties: 1 // At least one field must be provided
        },
        UpdateUserProfileResponse: {
            allOf: [
                { $ref: '#/components/schemas/SuccessMessage' },
                { type: 'object', properties: { user: { $ref: '#/components/schemas/UserProfile' } } }
            ]
        },

        // --- Driver Schemas ---
        DriverApplicationRequest: {
            type: 'object',
            properties: {
                vehicle_details: {
                    type: 'object',
                    nullable: true,
                    properties: {
                        model: { type: 'string', example: 'Toyota Corolla' },
                        plate_number: { type: 'string', example: '12۳45 ایران 67' },
                        color: { type: 'string', example: 'White' }
                    }
                }
            }
        },
        DriverApplicationResponse: {
            allOf: [
                { $ref: '#/components/schemas/SuccessMessage' },
                { type: 'object', properties: {
                    application: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1 },
                            user_id: { type: 'integer', example: 1 },
                            status: { type: 'string', example: 'pending_approval' },
                            created_at: { type: 'string', format: 'date-time' }
                        }
                    }
                }}
            ]
        },
        DriverProfileResponse: {
            type: 'object',
            properties: {
                driver_id: { type: 'integer' },
                user_id: { type: 'integer' },
                driver_status: { type: 'string', example: 'approved' },
                vehicle_details: { type: 'object', nullable: true, example: { model: "Pride 111", plate_number: "12ب345ایران67"} },
                phone_number: { type: 'string' },
                first_name: { type: 'string', nullable: true },
                last_name: { type: 'string', nullable: true },
                email: { type: 'string', format: 'email', nullable: true }
            }
        },
        DriverDocument: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                document_type: { type: 'string', example: 'license' },
                file_name: { type: 'string', example: 'license.jpg' },
                mime_type: { type: 'string', example: 'image/jpeg' },
                status: { type: 'string', example: 'pending_review' },
                uploaded_at: { type: 'string', format: 'date-time' },
                reviewed_at: { type: 'string', format: 'date-time', nullable: true },
                review_notes: { type: 'string', nullable: true }
            }
        },
        UploadDocumentResponse: {
            allOf: [
                { $ref: '#/components/schemas/SuccessMessage' },
                { type: 'object', properties: { document: { $ref: '#/components/schemas/DriverDocument' } } }
            ]
        }
      }
    },
  },
  // Path to the API docs (routes files)
  apis: [
    './src/modules/auth/auth.routes.js',
    './src/modules/users/user.routes.js',
    './src/modules/drivers/driver.routes.js',
    './src/modules/trips/trip.routes.js',
    './src/modules/bookings/booking.routes.js',
    './src/modules/ratings/rating.routes.js',
    './src/modules/admin/admin.routes.js',
    './src/modules/payments/payment.routes.js',
    './src/modules/transactions/transaction.routes.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
