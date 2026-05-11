const express = require('express');
const router = express.Router();
const publicApiController = require('../controllers/publicApiController');

// Public route - NO verifyToken middleware here!
router.get('/featured-alumnus', publicApiController.getFeaturedAlumnus);

module.exports = router;