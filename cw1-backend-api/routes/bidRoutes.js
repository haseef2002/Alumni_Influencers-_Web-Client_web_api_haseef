const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const verifyToken = require('../middleware/authMiddleware');

// We require the 'read:alumni' scope to place bids
router.post('/', verifyToken(['read:alumni']), bidController.placeBid);
router.get('/me', verifyToken(['read:alumni']), bidController.getMyBids);

module.exports = router;