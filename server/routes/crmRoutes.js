const express = require('express');
const router = express.Router();
const { 
    getSegments, 
    getCustomerProfile, 
    triggerAutomation,
    updateMyPreferences
} = require('../controllers/crmController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/segments').get(protect, admin, getSegments);
router.route('/customers/:id').get(protect, admin, getCustomerProfile);
router.route('/trigger-automation').post(protect, admin, triggerAutomation);
router.route('/my-preferences').put(protect, updateMyPreferences);

module.exports = router;
