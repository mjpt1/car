const express = require('express');
const transactionController = require('./transaction.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Viewing transaction history
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get the current user's transaction history
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: A paginated list of the user's transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  transactions:
 *                      type: array
 *                      items:
 *                          type: object # Define transaction schema in swagger config
 *                  totalPages: { type: integer }
 *                  currentPage: { type: integer }
 *                  totalTransactions: { type: integer }
 *       401:
 *         description: Unauthorized.
 */
router.get(
    '/',
    authenticateToken,
    transactionController.handleListUserTransactions
);

module.exports = router;
