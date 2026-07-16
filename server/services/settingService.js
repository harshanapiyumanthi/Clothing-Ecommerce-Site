const SystemSetting = require('../models/SystemSetting');

// Fallback defaults in case DB is missing seeding
const DEFAULTS = {
    taxRate: 8,
    shippingCharge: 15,
    freeShippingThreshold: 100,
    rewardPointsPerDollar: 1,
    membershipPremiumPrice: 49,
    membershipVIPPrice: 99,
    businessName: 'Elegance Fashion'
};

const getSetting = async (key) => {
    try {
        const setting = await SystemSetting.findOne({ key }).lean();
        if (setting) return setting.value;
        return DEFAULTS[key];
    } catch (error) {
        console.error(`Error fetching system setting for key "${key}":`, error.message);
        return DEFAULTS[key];
    }
};

const updateSetting = async (key, value) => {
    let setting = await SystemSetting.findOne({ key });
    if (setting) {
        setting.value = value;
        await setting.save();
    } else {
        setting = await SystemSetting.create({ key, value });
    }
    return setting;
};

module.exports = {
    getSetting,
    updateSetting,
    DEFAULTS
};
