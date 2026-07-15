const express = require('express');
const router = express.Router();
const { getRewardHistory } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getRewardHistory);

module.exports = router;
