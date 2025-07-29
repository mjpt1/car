const express = require('express');
const userController = require('./user.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { validate } = require('../auth/auth.validation'); // Re-use general validator from auth or create a shared one
const { updateUserProfileSchema } = require('./user.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management (view and update personal information)
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user's profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized (token missing or invalid).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
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
 *   put:
 *     summary: Update current user's profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserProfileResponse'
 *       400:
 *         description: Invalid input (e.g., validation error, no data provided).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict (e.g., email already in use).
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
router.route('/profile')
    .get(authenticateToken, userController.getMyProfile)
    .put(authenticateToken, validate(updateUserProfileSchema), userController.updateMyProfile);

/**
 * @swagger
 * /users/dashboard:
 *   get:
 *     summary: Get aggregated data for the user's dashboard
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userInfo:
 *                   type: object
 *                   properties:
 *                     first_name: { type: string, nullable: true }
 *                     last_name: { type: string, nullable: true }
 *                     email: { type: string, nullable: true }
 *                 passengerData:
 *                   type: object
 *                   properties:
 *                     total_bookings: { type: string, example: "5" }
 *                     upcoming_bookings: { type: string, example: "2" }
 *                     completed_bookings: { type: string, example: "3" }
 *                 driverData:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id: { type: integer }
 *                     driver_status: { type: string }
 *                     total_trips: { type: string, example: "10" }
 *                     upcoming_trips: { type: string, example: "4" }
 *                     completed_trips: { type: string, example: "6" }
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/dashboard',
    authenticateToken,
    userController.handleGetDashboardData
);

module.exports = router;
