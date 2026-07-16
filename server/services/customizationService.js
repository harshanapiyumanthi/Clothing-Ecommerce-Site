const CustomizationOption = require('../models/CustomizationOption');

// Hardcoded compatibility and configuration rules for premium Dream Dress personalization
const INCOMPATIBLE_PAIRS = [
    {
        field1: 'fabric',
        val1: 'Lace',
        field2: 'decoration',
        val2: 'Heavy Beading',
        message: 'Lace fabric is too delicate to support Heavy Beading decoration.'
    },
    {
        field1: 'neckDesign',
        val1: 'Off-Shoulder',
        field2: 'sleeveDesign',
        val2: 'Extra Long Puff Sleeves',
        message: 'Off-Shoulder neckline cannot be paired with Extra Long Puff Sleeves.'
    },
    {
        field1: 'fabric',
        val1: 'Chiffon',
        field2: 'dressLength',
        val2: 'Mini',
        message: 'Chiffon fabric requires longer flowing dress length styles (Midi or Maxi).'
    }
];

/**
 * Validates a dress customization set against design rules and constraints.
 * @param {Object} customization - The customization specifications: { fabric, neckDesign, sleeveDesign, dressLength, decoration, etc }
 */
const validateCustomization = async (customization) => {
    if (!customization) return { isValid: true };

    const { fabric, neckDesign, sleeveDesign, dressLength, decoration } = customization;

    // Check incompatible rules
    for (const rule of INCOMPATIBLE_PAIRS) {
        const val1 = customization[rule.field1];
        const val2 = customization[rule.field2];

        if (val1 && val2 && val1.toLowerCase() === rule.val1.toLowerCase() && val2.toLowerCase() === rule.val2.toLowerCase()) {
            return {
                isValid: false,
                message: rule.message
            };
        }
    }

    // Verify selected option items are active in DB
    const optionValues = [fabric, neckDesign, sleeveDesign, dressLength, decoration].filter(Boolean);
    if (optionValues.length > 0) {
        const dbOptions = await CustomizationOption.find({
            value: { $in: optionValues },
            isActive: true
        });

        const activeValues = dbOptions.map(o => o.value.toLowerCase());
        for (const val of optionValues) {
            if (!activeValues.includes(val.toLowerCase())) {
                return {
                    isValid: false,
                    message: `The option selection "${val}" is currently unavailable or out of stock.`
                };
            }
        }
    }

    return { isValid: true };
};

module.exports = {
    validateCustomization,
    INCOMPATIBLE_PAIRS
};
