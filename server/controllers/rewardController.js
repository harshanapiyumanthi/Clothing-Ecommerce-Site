const RewardHistory = require('../models/RewardHistory');
const User = require('../models/User');

// @desc    Get user's reward history
// @route   GET /api/rewards/history
// @access  Private
const getRewardHistory = async (req, res) => {
    try {
        const history = await RewardHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRewardHistory
};
