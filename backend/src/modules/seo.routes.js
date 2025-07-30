const express = require('express');
const seoController = require('./seo.controller');

const router = express.Router();

// These routes are typically placed at the root of the domain,
// so we will mount this router at the application root level, not under /api.

router.get('/sitemap.xml', seoController.generateSitemap);
router.get('/robots.txt', seoController.getRobotsTxt);

module.exports = router;
