const express = require('express');
const paymentController = require('./payment.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { validate } = require('../auth/auth.validation');
const { paymentRequestSchema, verifyPaymentSchema } = require('./payment.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and verification
 */

/**
 * @swagger
 * /payments/request:
 *   post:
 *     summary: Request a new payment for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_id: { type: integer }
 *               gateway: { type: string, default: "mock_gateway" }
 *     responses:
 *       200:
 *         description: Payment request created, returns a URL to the (mock) payment gateway.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment_url: { type: string }
 *                 transaction_id: { type: integer }
 *                 message: { type: string }
 *       400:
 *         description: Bad request (e.g., booking not found or not pending payment).
 *       401:
 *         description: Unauthorized.
 */
router.post(
    '/request',
    authenticateToken,
    validate(paymentRequestSchema),
    paymentController.handlePaymentRequest
);

/**
 * @swagger
 * /payments/verify:
 *   get:
 *     summary: Verify a payment (Callback URL from gateway)
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: transaction_id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         required: true
 *         schema: { type: string, enum: [success, failure] }
 *     responses:
 *       302:
 *         description: Redirects to the frontend result page with success/failure status.
 */
router.get(
    '/verify',
    // No auth token here, as this is called by the gateway server-to-server or via user redirect.
    // In a real app, you would use a webhook or verify a signature.
    validate(verifyPaymentSchema),
    paymentController.handlePaymentVerification
);


module.exports = router;
