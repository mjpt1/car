const express = require('express');
const driverController = require('./driver.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { validate } = require('../auth/auth.validation'); // General validator
const { applyToBecomeDriverSchema, uploadDocumentSchema } = require('./driver.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Driver Management
 *   description: Operations related to drivers, including application, profile, and document management.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /drivers/apply:
 *   post:
 *     summary: Apply to become a driver
 *     tags: [Driver Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false # Or true if vehicle_details are mandatory at application
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverApplicationRequest'
 *     responses:
 *       201:
 *         description: Application submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverApplicationResponse'
 *       400:
 *         description: Invalid input.
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
 *         description: User has already applied or is already a driver.
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
    '/apply',
    authenticateToken,
    validate(applyToBecomeDriverSchema), // Validation might be light if fields are optional
    driverController.handleApplyToBecomeDriver
);

/**
 * @swagger
 * /drivers/profile:
 *   get:
 *     summary: Get current driver's profile (if they are a driver)
 *     tags: [Driver Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved driver profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverProfileResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Driver profile not found (user is not a driver or application not found).
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
    '/profile',
    authenticateToken,
    driverController.handleGetDriverProfile
);

/**
 * @swagger
 * /drivers/documents/upload:
 *   post:
 *     summary: Upload a document for the driver
 *     tags: [Driver Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document_type, document]
 *             properties:
 *               document_type:
 *                 type: string
 *                 description: Type of the document (e.g., "license", "vehicle_registration").
 *                 example: "license"
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The document file to upload (JPG, PNG, PDF). Max 5MB.
 *           encoding: # Optional: for more detailed multipart encoding
 *             document_type:
 *               contentType: text/plain
 *             document:
 *               contentType: application/octet-stream # Or specific image/pdf types
 *     responses:
 *       201:
 *         description: Document uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadDocumentResponse'
 *       400:
 *         description: Invalid input, file type error, file size limit exceeded, or document_type missing.
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
 *       403:
 *         description: Forbidden (e.g., user is not registered as a driver).
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
    '/documents/upload',
    authenticateToken,
    driverController.uploadMiddleware, // Multer for file upload
    validate(uploadDocumentSchema),   // Zod for document_type
    driverController.multerErrorHandlerMiddleware, // Multer error handler
    driverController.handleUploadDriverDocument
);

/**
 * @swagger
 * /drivers/documents:
 *   get:
 *     summary: Get list of documents for the current driver
 *     tags: [Driver Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of documents.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DriverDocument'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (user is not a driver).
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
    '/documents',
    authenticateToken,
    driverController.handleGetDriverDocuments
);

module.exports = router;
