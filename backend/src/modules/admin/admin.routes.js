const express = require('express');
const adminController = require('./admin.controller');
const { authenticateToken, authorizeRole } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes in this module are protected and for admins only
router.use(authenticateToken, authorizeRole(['admin']));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administration panel operations
 */

// --- User Management ---
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get a list of all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search term for first name, last name, email, or phone number.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: A paginated list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile' # Reusing UserProfile schema
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 totalUsers: { type: integer }
 */
router.get('/users', adminController.handleListUsers);


// --- Driver Management ---
/**
 * @swagger
 * /admin/drivers:
 *   get:
 *     summary: Get a list of all drivers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending_approval, approved, rejected, suspended] }
 *         description: Filter drivers by status.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: A paginated list of drivers.
 */
router.get('/drivers', adminController.handleListDrivers);

/**
 * @swagger
 * /admin/drivers/{driverId}:
 *   get:
 *     summary: Get full details for a specific driver, including documents
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detailed driver profile.
 *       404:
 *         description: Driver not found.
 */
router.get('/drivers/:driverId', adminController.handleGetDriverDetails);

/**
 * @swagger
 * /admin/drivers/{driverId}/update-status:
 *   post:
 *     summary: Approve or reject a driver's application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Driver status updated successfully.
 */
router.post('/drivers/:driverId/update-status', adminController.handleUpdateDriverStatus);


// --- Document Management ---
/**
 * @swagger
 * /admin/documents/{documentId}/update-status:
 *   post:
 *     summary: Approve or reject a driver's document
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending_review]
 *               review_notes:
 *                 type: string
 *                 description: "Notes for the driver, especially on rejection."
 *     responses:
 *       200:
 *         description: Document status updated successfully.
 */
router.post('/documents/:documentId/update-status', adminController.handleUpdateDocumentStatus);


module.exports = router;
