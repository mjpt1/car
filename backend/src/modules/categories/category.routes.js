const express = require('express');
const categoryController = require('./category.controller');
const { authenticateToken, authorizeRole } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public route to get all categories
router.get('/', categoryController.getAll);

// Admin-only routes for CRUD operations
router.post('/', authenticateToken, authorizeRole(['admin']), categoryController.createNew);
router.put('/:id', authenticateToken, authorizeRole(['admin']), categoryController.updateOne);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), categoryController.deleteOne);

module.exports = router;
