const express = require('express');
const tripController = require('./trip.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
// const { authorizeRole } = require('../../middleware/auth.middleware'); // Assuming you have this
const { validate } = require('../auth/auth.validation'); // General validator
const { createTripSchema, searchTripsSchema } = require('./trip.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management and searching
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Trip ID
 *         origin_location:
 *           type: string
 *         destination_location:
 *           type: string
 *         departure_time:
 *           type: string
 *           format: date-time
 *         estimated_arrival_time:
 *           type: string
 *           format: date-time
 *         driver_id:
 *           type: integer
 *         base_seat_price:
 *           type: number
 *           format: float
 *         status:
 *           type: string
 *           example: scheduled
 *         available_seats:
 *           type: integer
 *           description: Number of seats initially marked as available.
 *         notes:
 *           type: string
 *           nullable: true
 *         driver_first_name:
 *           type: string
 *           nullable: true
 *         driver_last_name:
 *           type: string
 *           nullable: true
 *         vehicle_details:
 *           type: object
 *           nullable: true
 *         seat_layout:
 *           type: object
 *           nullable: true
 *         actual_available_seats:
 *           type: integer
 *           description: Current count of actually available seats.
 *     TripDetailsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Trip' # Base trip info
 *         - type: object
 *           properties:
 *             driver_seat_layout: # Renamed from seat_layout in trip service for clarity
 *               type: object
 *               description: The seat layout of the vehicle used for this trip.
 *             driver_vehicle_details:
 *               type: object
 *               description: Details of the vehicle.
 *             driver_phone_number:
 *                type: string
 *             seats:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   seat_number: { type: string }
 *                   status: { type: string } # available, booked, locked, etc.
 *                   price: { type: number, format: float }
 *                   user_id: { type: integer, nullable: true, description: "ID of user who booked this seat" }
 *     CreateTripRequest:
 *       type: object
 *       required: [origin_location, destination_location, departure_time, estimated_arrival_time, driver_id, base_seat_price]
 *       properties:
 *         origin_location: { type: string, example: "Tehran" }
 *         destination_location: { type: string, example: "Isfahan" }
 *         departure_time: { type: string, format: date-time, example: "2024-08-15T10:00:00Z" }
 *         estimated_arrival_time: { type: string, format: date-time, example: "2024-08-15T15:00:00Z" }
 *         driver_id: { type: integer, example: 1 }
 *         base_seat_price: { type: number, example: 250000.00 }
 *         notes: { type: string, nullable: true, example: "VIP bus" }
 *     CreateTripResponse:
 *       type: object
 *       properties:
 *         message: { type: string }
 *         trip:
 *           type: object # Simplified trip object returned after creation
 *           properties:
 *             id: { type: integer }
 *             available_seats: { type: integer }
 *             driver_info: { type: object, properties: {id: {type: integer}, vehicle_details: {type: object, nullable: true}} }
 *             seat_layout_used: { type: object }
 *
 */

// TODO: Add authorizeRole(['admin']) middleware for create trip route in Phase 5 (Admin Panel)
/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Create a new trip (Admin only)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: [] # Indicates JWT is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTripRequest'
 *     responses:
 *       201:
 *         description: Trip created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTripResponse'
 *       400:
 *         description: Invalid input or driver/seat layout issue.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (User is not an admin).
 *       500:
 *         description: Internal server error.
 */
router.post(
    '/',
    authenticateToken,
    // authorizeRole(['admin']), // To be enabled when roles are fully implemented
    validate(createTripSchema),
    tripController.handleCreateTrip
);

/**
 * @swagger
 * /trips/search:
 *   get:
 *     summary: Search for available trips
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema:
 *           type: string
 *         description: Origin location for the trip.
 *         example: "Tehran"
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination location for the trip.
 *         example: "Isfahan"
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date of the trip (YYYY-MM-DD).
 *         example: "2024-08-15"
 *       - in: query
 *         name: passengers
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Number of passengers.
 *     responses:
 *       200:
 *         description: A list of trips matching the criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/search',
    validate(searchTripsSchema), // Validates query parameters
    tripController.handleSearchTrips
);

/**
 * @swagger
 * /trips/{tripId}:
 *   get:
 *     summary: Get details of a specific trip, including seat map
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip to retrieve.
 *     responses:
 *       200:
 *         description: Detailed information about the trip and its seats.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripDetailsResponse'
 *       404:
 *         description: Trip not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/:tripId',
    tripController.handleGetTripDetails
);

/**
 * @swagger
 * /trips/{tripId}/chat:
 *   get:
 *     summary: Get chat history for a specific trip
 *     tags: [Trips, Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip.
 *     responses:
 *       200:
 *         description: An array of chat messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object # Define ChatMessage schema in swagger.config.js if needed
 *                 properties:
 *                   id: { type: integer }
 *                   trip_id: { type: integer }
 *                   sender_id: { type: integer }
 *                   message_text: { type: string }
 *                   file_url: { type: string, nullable: true }
 *                   created_at: { type: string, format: date-time }
 *                   sender: { type: object, properties: { id: {type: integer}, first_name: {type: string}, last_name: {type: string} } }
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not part of this trip).
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/:tripId/chat',
    authenticateToken,
    // TODO: Add middleware to authorize if user is part of the trip
    tripController.handleGetChatHistory
);


// --- Test Route for Notifications ---
/**
 * @swagger
 * /trips/{tripId}/test-notification:
 *   post:
 *     summary: Send a test notification to a trip room (for development)
 *     tags: [Trips, Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "This is a test notification for trip occupants."
 *               status:
 *                 type: string
 *                 example: "delayed"
 *     responses:
 *       200:
 *         description: Notification sent successfully.
 */
router.post('/:tripId/test-notification', authenticateToken, (req, res) => {
    const { tripId } = req.params;
    const { message, status } = req.body;
    const io = req.app.get('socketio'); // Get io instance from app
    if (io) {
        const roomName = `trip:${tripId}`;
        io.to(roomName).emit('tripStatusUpdate', {
            tripId,
            status: status || 'updated',
            message: message || `A test update for trip ${tripId}.`
        });
        res.status(200).json({ success: true, message: `Test notification sent to room ${roomName}` });
    } else {
        res.status(500).json({ success: false, message: 'Socket.IO not initialized.' });
    }
});


module.exports = router;
