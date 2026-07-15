const express = require('express');
const router = express.Router();
const { saveDesign, getMySavedDesigns } = require('../controllers/savedDesignController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, saveDesign).get(protect, getMySavedDesigns);

module.exports = router;
