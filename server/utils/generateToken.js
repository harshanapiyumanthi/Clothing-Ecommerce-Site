const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Requires JWT_SECRET to be added to .env
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_elegance_2026', {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
