const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const User = require('../models/User');
const ShippingZone = require('../models/ShippingZone');
const Warehouse = require('../models/Warehouse');
const Supplier = require('../models/Supplier');
const Translation = require('../models/Translation');
const VendorStore = require('../models/VendorStore');
const Order = require('../models/Order');

// @desc    Get consolidated user and catalog context for AI Personal Stylist
// @route   GET /api/future/ai-stylist
// @access  Private
const getAiStylistContext = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('name preferences');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Retrieve previous purchase categories and products
    const previousOrders = await Order.find({ user: req.user._id, isPaid: true }).select('orderItems');
    const purchasedItems = [];
    previousOrders.forEach(o => {
        o.orderItems.forEach(item => purchasedItems.push(item.name));
    });

    // Gather color & style matched catalog options
    const favoriteColors = user.preferences?.favoriteColors || [];
    const favoriteSizes = user.preferences?.favoriteSizes || [];
    const favoriteStyles = user.preferences?.favoriteStyles || [];

    // Query matched products
    const matchedProducts = await Product.find({
        $or: [
            { colors: { $in: favoriteColors } },
            { sizes: { $in: favoriteSizes } },
            { tags: { $in: favoriteStyles } }
        ],
        stock: { $gt: 0 }
    }).limit(10).select('name price colors sizes tags images');

    // Simulate AI Personal Stylist suggestions
    const mockOccasions = {
        Wedding: 'For a wedding, we highly recommend the Silk Evening Gown paired with a gold ring accessory.',
        Office: 'For business engagements, the Tailor-Fit Merino Wool Blazer creates an elegant, professional posture.',
        Casual: 'For day-to-day style, the hand-washed Casual Denim Overshirt is exceptionally comfortable.'
    };

    res.json({
        success: true,
        userPreferences: {
            colors: favoriteColors,
            sizes: favoriteSizes,
            styles: favoriteStyles,
            priceRange: user.preferences?.favoritePriceRange || 'Any'
        },
        purchasedHistory: purchasedItems,
        matchedCatalog: matchedProducts,
        stylistAdvice: mockOccasions
    });
});

// @desc    Register a new push token for future mobile app support
// @route   POST /api/future/mobile/register-device
// @access  Private
const registerDeviceToken = asyncHandler(async (req, res) => {
    const { token, platform, deviceId } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if token exists
    const exists = user.deviceTokens.some(d => d.token === token);
    if (!exists) {
        user.deviceTokens.push({ token, platform: platform || 'web', deviceId });
        await user.save();
    }

    res.json({ success: true, message: 'Device token registered successfully' });
});

// @desc    Get dynamic multi-currency rates configuration
// @route   GET /api/future/currencies
// @access  Public
const getCurrencies = asyncHandler(async (req, res) => {
    // Current base: LKR, conversion reference to USD & EUR
    const rates = {
        LKR: 1,
        USD: 0.0033, // 1 LKR = 0.0033 USD
        EUR: 0.0030  // 1 LKR = 0.0030 EUR
    };
    res.json({ success: true, rates });
});

// @desc    Get translation dictionary
// @route   GET /api/future/translations
// @access  Public
const getTranslations = asyncHandler(async (req, res) => {
    const translations = await Translation.find();
    
    // Seed standard fallback UI keys if dictionary is empty
    if (translations.length === 0) {
        const fallbacks = [
            { key: 'navbar_shop', values: { en: 'Shop', si: 'සාප්පුව', ta: 'கடை' }, category: 'Navbar' },
            { key: 'navbar_cart', values: { en: 'Cart', si: 'කරත්තය', ta: 'வண்டி' }, category: 'Navbar' },
            { key: 'btn_checkout', values: { en: 'Proceed to Checkout', si: 'පියවීම් වෙත යන්න', ta: 'செக்அවුட் செய்ய தொடரவும்' }, category: 'Buttons' },
            { key: 'lbl_support', values: { en: 'Help & Support', si: 'උදවු සහ සහාය', ta: 'உதவி & ஆதரவு' }, category: 'General' }
        ];
        await Translation.insertMany(fallbacks);
        return res.json({ success: true, translations: fallbacks });
    }

    res.json({ success: true, translations });
});

// @desc    Update translation values
// @route   PUT /api/future/translations/:id
// @access  Private/Admin
const updateTranslation = asyncHandler(async (req, res) => {
    const { values } = req.body;
    const translation = await Translation.findById(req.params.id);

    if (translation) {
        translation.values = { ...translation.values, ...values };
        await translation.save();
        res.json({ success: true, translation });
    } else {
        res.status(404).json({ success: false, message: 'Translation key not found' });
    }
});

// @desc    Get shipping zones
// @route   GET /api/future/shipping-zones
// @access  Private/Admin
const getShippingZones = asyncHandler(async (req, res) => {
    const zones = await ShippingZone.find();
    
    if (zones.length === 0) {
        const defaultZones = [
            { name: 'South Asia (Local)', countries: ['Sri Lanka', 'India', 'Maldives'], baseCost: 350, taxRate: 15, dutyRate: 0, deliveryEstimate: '1-3 Business Days' },
            { name: 'North America', countries: ['USA', 'Canada'], baseCost: 4500, taxRate: 8, dutyRate: 5, deliveryEstimate: '5-7 Business Days' },
            { name: 'Europe', countries: ['UK', 'Germany', 'France'], baseCost: 5200, taxRate: 20, dutyRate: 8, deliveryEstimate: '4-6 Business Days' }
        ];
        await ShippingZone.insertMany(defaultZones);
        return res.json({ success: true, zones: defaultZones });
    }

    res.json({ success: true, zones });
});

// @desc    Create/Update shipping zone
// @route   POST /api/future/shipping-zones
// @access  Private/Admin
const saveShippingZone = asyncHandler(async (req, res) => {
    const { id, name, countries, baseCost, taxRate, dutyRate, deliveryEstimate, courierPartner } = req.body;

    if (id) {
        const zone = await ShippingZone.findById(id);
        if (zone) {
            zone.name = name || zone.name;
            zone.countries = countries || zone.countries;
            zone.baseCost = baseCost !== undefined ? baseCost : zone.baseCost;
            zone.taxRate = taxRate !== undefined ? taxRate : zone.taxRate;
            zone.dutyRate = dutyRate !== undefined ? dutyRate : zone.dutyRate;
            zone.deliveryEstimate = deliveryEstimate || zone.deliveryEstimate;
            zone.courierPartner = courierPartner || zone.courierPartner;
            await zone.save();
            return res.json({ success: true, zone });
        }
    }

    const newZone = await ShippingZone.create({
        name, countries, baseCost, taxRate, dutyRate, deliveryEstimate, courierPartner
    });
    res.status(201).json({ success: true, zone: newZone });
});

// @desc    Get warehouses
// @route   GET /api/future/inventory/warehouses
// @access  Private/Admin
const getWarehouses = asyncHandler(async (req, res) => {
    const warehouses = await Warehouse.find().populate('stockMap.product', 'name price stock');
    
    if (warehouses.length === 0) {
        const defaultWarehouses = [
            { name: 'Colombo Main Depot', location: 'Colombo, Sri Lanka', capacity: 20000 },
            { name: 'Kandy Central Hub', location: 'Kandy, Sri Lanka', capacity: 8000 }
        ];
        await Warehouse.insertMany(defaultWarehouses);
        return res.json({ success: true, warehouses: defaultWarehouses });
    }

    res.json({ success: true, warehouses });
});

// @desc    Distribute stock across warehouse locations
// @route   PUT /api/future/inventory/warehouses/:id/stock
// @access  Private/Admin
const updateWarehouseStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    const stockItemIdx = warehouse.stockMap.findIndex(s => s.product.toString() === productId);
    if (stockItemIdx !== -1) {
        warehouse.stockMap[stockItemIdx].quantity = quantity;
    } else {
        warehouse.stockMap.push({ product: productId, quantity });
    }

    await warehouse.save();
    res.json({ success: true, warehouse });
});

// @desc    Get fabric and material suppliers
// @route   GET /api/future/inventory/suppliers
// @access  Private/Admin
const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find();
    
    if (suppliers.length === 0) {
        const defaultSuppliers = [
            { name: 'Lanka Silks Co.', contactPerson: 'Arjuna Silva', phone: '+94 77 123 4567', email: 'arjuna@lankasilks.com', suppliedCategories: ['Fabric'], suppliedMaterials: ['Georgette Silk', 'Mulberry Silk'] },
            { name: 'DecoButtons Ltd.', contactPerson: 'Nimal Jay', phone: '+94 81 987 6543', email: 'nimal@decobuttons.lk', suppliedCategories: ['Accessories'], suppliedMaterials: ['Pearl Buttons', 'Brass Hooks'] }
        ];
        await Supplier.insertMany(defaultSuppliers);
        return res.json({ success: true, suppliers: defaultSuppliers });
    }

    res.json({ success: true, suppliers });
});

// @desc    Create/Update supplier profiles
// @route   POST /api/future/inventory/suppliers
// @access  Private/Admin
const saveSupplier = asyncHandler(async (req, res) => {
    const { id, name, contactPerson, phone, email, suppliedCategories, suppliedMaterials, contractStatus } = req.body;

    if (id) {
        const supplier = await Supplier.findById(id);
        if (supplier) {
            supplier.name = name || supplier.name;
            supplier.contactPerson = contactPerson || supplier.contactPerson;
            supplier.phone = phone || supplier.phone;
            supplier.email = email || supplier.email;
            supplier.suppliedCategories = suppliedCategories || supplier.suppliedCategories;
            supplier.suppliedMaterials = suppliedMaterials || supplier.suppliedMaterials;
            supplier.contractStatus = contractStatus || supplier.contractStatus;
            await supplier.save();
            return res.json({ success: true, supplier });
        }
    }

    const newSupplier = await Supplier.create({
        name, contactPerson, phone, email, suppliedCategories, suppliedMaterials, contractStatus
    });
    res.status(201).json({ success: true, supplier: newSupplier });
});

// @desc    Get marketplace vendors and designers overview
// @route   GET /api/future/marketplace
// @access  Private/Admin
const getMarketplaceVendors = asyncHandler(async (req, res) => {
    const vendors = await VendorStore.find().populate('owner', 'name email');
    
    if (vendors.length === 0) {
        // Find existing users with role 'designer' to register mock vendor stores
        const designers = await User.find({ role: 'designer' });
        
        const defaultStores = [];
        designers.forEach((designer, idx) => {
            defaultStores.push({
                name: `${designer.name} Atelier`,
                owner: designer._id,
                commissionRate: 12,
                status: 'Approved'
            });
        });

        if (defaultStores.length > 0) {
            await VendorStore.insertMany(defaultStores);
            return res.json({ success: true, vendors: defaultStores });
        }
    }

    res.json({ success: true, vendors });
});

// @desc    Approve/Update vendor stores
// @route   PUT /api/future/marketplace/:id
// @access  Private/Admin
const updateMarketplaceVendor = asyncHandler(async (req, res) => {
    const { status, commissionRate } = req.body;
    const vendor = await VendorStore.findById(req.params.id);

    if (vendor) {
        if (status) vendor.status = status;
        if (commissionRate !== undefined) vendor.commissionRate = commissionRate;
        await vendor.save();
        res.json({ success: true, vendor });
    } else {
        res.status(404).json({ success: false, message: 'Vendor store not found' });
    }
});

module.exports = {
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
};
