const express = require('express');
const router = express.Router();
const { getMembershipPlans, upgradeMembership } = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getMembershipPlans);
router.post('/upgrade', protect, upgradeMembership);

module.exports = router;
