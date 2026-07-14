const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

const getBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, banners });
});

const createBanner = asyncHandler(async (req, res) => {
    const { title, subtitle, link, order } = req.body;
    let image = {};
    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, 'elegance/banners');
        image = { public_id: result.public_id, url: result.secure_url };
    }
    const banner = await Banner.create({ title, subtitle, link, order, image });
    res.status(201).json({ success: true, banner });
});

const updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) { res.status(404); throw new Error('Banner not found'); }
    const { title, subtitle, link, order, isActive } = req.body;
    banner.title = title ?? banner.title;
    banner.subtitle = subtitle ?? banner.subtitle;
    banner.link = link ?? banner.link;
    banner.order = order ?? banner.order;
    banner.isActive = isActive ?? banner.isActive;
    if (req.file) {
        if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
        const result = await uploadToCloudinary(req.file.buffer, 'elegance/banners');
        banner.image = { public_id: result.public_id, url: result.secure_url };
    }
    await banner.save();
    res.json({ success: true, banner });
});

const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) { res.status(404); throw new Error('Banner not found'); }
    if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted' });
});

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };
