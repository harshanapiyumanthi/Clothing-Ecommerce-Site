const express = require('express');
const router = express.Router();
const { createCustomOrder, getMyCustomOrders, getAllCustomOrders, updateCustomOrderStatus } = require('../controllers/customOrderController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('images', 5), createCustomOrder);
router.get('/my', protect, getMyCustomOrders);
router.get('/', protect, admin, getAllCustomOrders);
router.put('/:id', protect, admin, updateCustomOrderStatus);

module.exports = router;
