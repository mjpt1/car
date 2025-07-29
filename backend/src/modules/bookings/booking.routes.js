const express = require('express');
const bookingController = require('./booking.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { validate } = require('../auth/auth.validation'); // General validator
const { createBookingSchema } = require('./booking.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management for users
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CreateBookingRequest:
 *       type: object
 *       required: [trip_id, seat_ids]
 *       properties:
 *         trip_id:
 *           type: integer
 *           description: ID of the trip to book seats on.
 *           example: 1
 *         seat_ids:
 *           type: array
 *           items:
 *             type: integer
 *           minItems: 1
 *           description: Array of seat IDs to book.
 *           example: [10, 11]
 *     SeatBookedInfo:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         seat_number: { type: string }
 *         price: { type: number, format: float }
 *     CreateBookingResponse:
 *       type: object
 *       properties:
 *         booking_id: { type: integer }
 *         trip_id: { type: integer }
 *         user_id: { type: integer }
 *         seats_booked:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SeatBookedInfo'
 *         total_amount: { type: number, format: float }
 *         status: { type: string, example: "pending_payment" }
 *         booking_time: { type: string, format: date-time }
 *         message: { type: string }
 *     BookingDetails: # For listing user's bookings
 *       type: object
 *       properties:
 *         booking_id: { type: integer }
 *         booking_status: { type: string }
 *         total_amount: { type: number, format: float }
 *         booking_time: { type: string, format: date-time }
 *         trip_id: { type: integer }
 *         origin_location: { type: string }
 *         destination_location: { type: string }
 *         departure_time: { type: string, format: date-time }
 *         estimated_arrival_time: { type: string, format: date-time }
 *         booked_seats_details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               seat_id: { type: integer }
 *               seat_number: { type: string }
 *               price: { type: number, format: float }
 *         driver_id: { type: integer }
 *         driver_first_name: { type: string, nullable: true }
 *         driver_last_name: { type: string, nullable: true }
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking for selected seats on a trip
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created successfully (e.g., pending payment).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateBookingResponse'
 *       400:
 *         description: Invalid input (e.g., trip not found, seats not available, validation error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (user not logged in).
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
    '/',
    authenticateToken,
    validate(createBookingSchema),
    bookingController.handleCreateBooking
);

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get all bookings made by the current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookingDetails'
 *       401:
 *         description: Unauthorized.
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
router.get(
    '/my-bookings',
    authenticateToken,
    bookingController.handleGetMyBookings
);

module.exports = router;
