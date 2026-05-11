const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/me', verifyToken(['read:alumni']), profileController.getProfile);
router.post('/me', verifyToken(['read:alumni']), profileController.upsertProfile);

module.exports = router;