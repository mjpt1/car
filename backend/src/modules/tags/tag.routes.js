const express = require('express');
const tagController = require('./tag.controller');
const { authenticateToken, authorizeRole } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public route to get all tags
router.get('/', tagController.getAll);

// Admin-only routes for CRUD operations
router.post('/', authenticateToken, authorizeRole(['admin']), tagController.createNew);
router.put('/:id', authenticateToken, authorizeRole(['admin']), tagController.updateOne);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), tagController.deleteOne);

module.exports = router;
