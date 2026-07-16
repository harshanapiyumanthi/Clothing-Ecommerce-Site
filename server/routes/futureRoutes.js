const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAiStylistContext,
    registerDeviceToken,
    getCurrencies,
    getTranslations,
    updateTranslation,
    getShippingZones,
    saveShippingZone,
    getWarehouses,
    updateWarehouseStock,
    getSuppliers,
    saveSupplier,
    getMarketplaceVendors,
    updateMarketplaceVendor
} = require('../controllers/futureController');

// Client Endpoints
router.get('/ai-stylist', protect, getAiStylistContext);
router.post('/mobile/register-device', protect, registerDeviceToken);
router.get('/currencies', getCurrencies);
router.get('/translations', getTranslations);

// Protected Admin Endpoints
router.put('/translations/:id', protect, admin, updateTranslation);

router.route('/shipping-zones')
    .get(protect, admin, getShippingZones)
    .post(protect, admin, saveShippingZone);

router.get('/inventory/warehouses', protect, admin, getWarehouses);
router.put('/inventory/warehouses/:id/stock', protect, admin, updateWarehouseStock);

router.route('/inventory/suppliers')
    .get(protect, admin, getSuppliers)
    .post(protect, admin, saveSupplier);

router.route('/marketplace')
    .get(protect, admin, getMarketplaceVendors);

router.route('/marketplace/:id')
    .put(protect, admin, updateMarketplaceVendor);

module.exports = router;
