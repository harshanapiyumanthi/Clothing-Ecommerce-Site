const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');

// @desc    Get all active membership plans
// @route   GET /api/memberships
// @access  Public
const getMembershipPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.find({ isActive: true });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upgrade membership (Simulated Checkout)
// @route   POST /api/memberships/upgrade
// @access  Private
const upgradeMembership = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await MembershipPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const user = await User.findById(req.user._id);

        if (user.membershipTier === plan.name) {
            return res.status(400).json({ success: false, message: 'You are already on this plan.' });
        }

        // Simulate successful payment...
        user.membershipTier = plan.name;
        user.membershipStartDate = Date.now();
        
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + plan.durationMonths);
        user.membershipExpiry = expiry;

        await user.save();

        res.json({ 
            success: true, 
            message: `Successfully upgraded to ${plan.name} Membership!`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                membershipTier: user.membershipTier,
                membershipExpiry: user.membershipExpiry,
                rewardPoints: user.rewardPoints,
                token: req.headers.authorization.split(' ')[1] // keep existing token
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMembershipPlans,
    upgradeMembership
};
