const express = require('express');
const authController = require('./auth.controller');
const { validate } = require('./auth.validation'); // Assuming general validator is here
const {
    requestOtpSchema,
    verifyOtpRegisterSchema,
    loginSchema,
    requestPasswordResetSchema,
    verifyPasswordResetOtpSchema,
    resetPasswordSchema
} = require('./auth.validation');

const router = express.Router();

// --- Swagger Tag Definition ---
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

// --- Registration Routes ---
/**
 * @swagger
 * /auth/register/request-otp:
 *   post:
 *     summary: Request an OTP for new user registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestOtpBody'
 *     responses:
 *       200:
 *         description: OTP sent successfully (OTP included for testing purposes only in dev).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestOtpResponse'
 *       400:
 *         description: Invalid input (e.g., invalid phone number format, or other validation error by Zod).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/register/request-otp',
    validate(requestOtpSchema),
    authController.handleRequestRegistrationOtp
);

/**
 * @swagger
 * /auth/register/verify-otp:
 *   post:
 *     summary: Verify OTP and complete new user registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOtpRegisterResponse'
 *       400:
 *         description: Invalid input (e.g., OTP mismatch, weak password, user already exists).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/register/verify-otp',
    validate(verifyOtpRegisterSchema),
    authController.handleVerifyOtpAndRegister
);

// --- Login Route ---
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user info.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Unauthorized (e.g., invalid credentials, user not found).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/login',
    validate(loginSchema),
    authController.handleLogin
);

// --- Password Reset Routes ---
/**
 * @swagger
 * /auth/forgot-password/request-otp:
 *   post:
 *     summary: Request an OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestOtpBody'
 *     responses:
 *       200:
 *         description: Password reset OTP sent (OTP included for testing).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestOtpResponse'
 *       400:
 *         description: Invalid input or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/forgot-password/request-otp',
    validate(requestPasswordResetSchema),
    authController.handleRequestPasswordResetOtp
);

/**
 * @swagger
 * /auth/forgot-password/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordVerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       400:
 *         description: Invalid or expired OTP.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/forgot-password/verify-otp',
    validate(verifyPasswordResetOtpSchema),
    authController.handleVerifyPasswordResetOtp
);

/**
 * @swagger
 * /auth/forgot-password/reset:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password has been reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       400:
 *         description: Invalid input, OTP mismatch, or weak new password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/forgot-password/reset',
    validate(resetPasswordSchema),
    authController.handleResetPassword
);

module.exports = router;
