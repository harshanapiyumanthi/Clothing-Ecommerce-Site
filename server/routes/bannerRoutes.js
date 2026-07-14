const express = require('express');
const router = express.Router();
const { getBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getBanners);
router.post('/', protect, admin, upload.single('image'), createBanner);
router.put('/:id', protect, admin, upload.single('image'), updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
