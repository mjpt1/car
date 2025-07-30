const express = require('express');
const articleController = require('./article.controller');
const { authenticateToken, authorizeRole } = require('../../middleware/auth.middleware');
const { validate } = require('../auth/auth.validation');
const { createArticleSchema, updateArticleSchema } = require('./article.validation');

const router = express.Router();
const adminRouter = express.Router();

// --- Admin Routes ---
// All admin routes are protected
adminRouter.use(authenticateToken, authorizeRole(['admin']));

adminRouter.post('/', validate(createArticleSchema), articleController.handleCreateArticle);
adminRouter.get('/', articleController.handleListArticles); // Admin can also list all articles (can be a different service later)
adminRouter.get('/:id', articleController.handleGetArticleById);
adminRouter.put('/:id', validate(updateArticleSchema), articleController.handleUpdateArticle);
adminRouter.delete('/:id', articleController.handleDeleteArticle);

// --- Public Routes ---
router.get('/', articleController.handleListArticles);
router.get('/:slug', articleController.handleGetArticleBySlug);


module.exports = {
    publicRoutes: router,
    adminRoutes: adminRouter,
};
