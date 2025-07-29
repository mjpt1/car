const express = require('express');
const ratingController = require('./rating.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { validate } = require('../auth/auth.validation');
const { createRatingSchema } = require('./rating.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Submitting ratings and feedback for trips
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Submit a rating for a completed trip (e.g., passenger rating a driver)
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRatingRequest'
 *     responses:
 *       201:
 *         description: Rating submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 rating:
 *                   type: object # Define Rating schema in swagger.config.js
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (e.g., user was not on the trip, or trip not completed).
 *       404:
 *         description: Trip not found.
 *       500:
 *         description: Internal server error.
 */
router.post(
    '/',
    authenticateToken,
    validate(createRatingSchema),
    ratingController.handleCreateRating
);

module.exports = router;
