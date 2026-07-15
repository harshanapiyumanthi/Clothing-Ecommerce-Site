const express = require('express');
const router = express.Router();
const { getFabrics, createFabric, updateFabric, deleteFabric } = require('../controllers/fabricController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getFabrics).post(protect, admin, createFabric);
router.route('/:id').put(protect, admin, updateFabric).delete(protect, admin, deleteFabric);

module.exports = router;
