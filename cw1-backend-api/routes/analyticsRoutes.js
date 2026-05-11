const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/authMiddleware');

// Notice the strict scoping: Only tokens with 'read:analytics' can access this!
router.get('/dashboard-data', verifyToken(['read:analytics']), analyticsController.getDashboardData);

module.exports = router;