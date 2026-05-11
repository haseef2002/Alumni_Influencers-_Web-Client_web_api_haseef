const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { validateRegistration } = require('../middleware/validate');

// Standard Auth Routes (No token needed yet)
router.post('/register', validateRegistration, authController.register);
router.post('/login', authController.login);

// Advanced Security Routes (Token required)
router.post('/revoke', verifyToken([]), authController.revokeToken);

// Pass specific scope ['read:analytics'] to restrict access
router.post('/revoke', verifyToken([]), authController.revokeToken);
router.get('/usage-stats', verifyToken(['read:analytics']), authController.getUsageStats);

module.exports = router;