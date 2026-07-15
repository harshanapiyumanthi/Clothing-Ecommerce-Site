const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    fullName: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Sri Lanka' },
    phone: { type: String },
    isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        phone: { type: String, default: '' },
        avatar: {
            public_id: { type: String, default: '' },
            url: { type: String, default: '' },
        },
        addresses: [addressSchema],
        membershipTier: {
            type: String,
            enum: ['Standard', 'Premium'],
            default: 'Standard',
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        passwordChangedAt: { type: Date },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now();
    next();
});

// Method to match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
