const { z } = require('zod'); // Using Zod for validation

const requestOtpSchema = z.object({
  body: z.object({
    phone_number: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }), // E.164 format
  }),
});

const verifyOtpRegisterSchema = z.object({
  body: z.object({
    phone_number: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    phone_number: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    password: z.string().min(1, { message: "Password is required" }), // Min 1, as it will be checked for actual strength by bcrypt
  }),
});

const requestPasswordResetSchema = z.object({
    body: z.object({
      phone_number: z
        .string()
        .min(10, { message: "Phone number must be at least 10 digits" })
        .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    }),
  });

const verifyPasswordResetOtpSchema = z.object({
  body: z.object({
    phone_number: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    phone_number: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }),
    otp: z.string().length(6, { message: "OTP must be 6 digits" }), // OTP is passed again for final verification
    new_password: z.string().min(8, { message: "New password must be at least 8 characters long" }),
  }),
});


// Middleware for validation
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e) {
    return res.status(400).json({ errors: e.errors });
  }
};

module.exports = {
  validate,
  requestOtpSchema,
  verifyOtpRegisterSchema,
  loginSchema,
  requestPasswordResetSchema,
  verifyPasswordResetOtpSchema,
  resetPasswordSchema,
};
