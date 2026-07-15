const express = require('express');
const router = express.Router();
const { getColors, createColor, updateColor, deleteColor } = require('../controllers/colorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getColors).post(protect, admin, createColor);
router.route('/:id').put(protect, admin, updateColor).delete(protect, admin, deleteColor);

module.exports = router;
