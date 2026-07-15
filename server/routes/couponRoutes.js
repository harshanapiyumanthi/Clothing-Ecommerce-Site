const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} = require('../controllers/couponController');

// Client validations (private)
router.post('/validate', protect, validateCoupon);

// Administrative CRUD
router.route('/')
    .post(protect, admin, createCoupon)
    .get(protect, admin, getAllCoupons);

router.route('/:id')
    .get(protect, admin, getCouponById)
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

module.exports = router;
