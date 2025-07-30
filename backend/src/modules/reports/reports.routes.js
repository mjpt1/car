const express = require('express');
const reportsController = require('./reports.controller');

const router = express.Router();

// Note: These routes will be mounted under /admin/reports and will be protected by admin auth middleware there.

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Generating reports and statistics for admins
 */

/**
 * @swagger
 * /admin/reports/bookings:
 *   get:
 *     summary: Get a paginated report of all bookings
 *     tags: [Admin, Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending_payment, confirmed, completed, cancelled_by_user] }
 *       - in: query
 *         name: driverId
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2024-01-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2024-12-31" }
 *     responses:
 *       200:
 *         description: A paginated list of bookings.
 */
router.get('/bookings', reportsController.handleGetBookingsReport);

/**
 * @swagger
 * /admin/reports/bookings/download:
 *   get:
 *     summary: Download a CSV report of bookings
 *     tags: [Admin, Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending_payment, confirmed, completed, cancelled_by_user] }
 *       - in: query
 *         name: driverId
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2024-01-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2024-12-31" }
 *     responses:
 *       200:
 *         description: A CSV file of the bookings report.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/bookings/download', reportsController.handleDownloadBookingsCsv);

/**
 * @swagger
 * /admin/reports/financial:
 *   get:
 *     summary: Get a financial report (e.g., daily revenue)
 *     tags: [Admin, Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: "2024-07-01" }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: "2024-07-31" }
 *     responses:
 *       200:
 *         description: An array of financial data grouped by date.
 */
router.get('/financial', reportsController.handleGetFinancialReport);

/**
 * @swagger
 * /admin/reports/stats:
 *   get:
 *     summary: Get overall system statistics
 *     tags: [Admin, Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Key system statistics.
 */
router.get('/stats', reportsController.handleGetSystemStats);


module.exports = router;
