const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
dotenv.config({ override: true });

const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(xss());
app.use(compression());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({
    verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/api/payments/webhook')) {
            req.rawBody = buf;
        }
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const productRoutes     = require('./routes/productRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const cartRoutes        = require('./routes/cartRoutes');
const wishlistRoutes    = require('./routes/wishlistRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const bannerRoutes      = require('./routes/bannerRoutes');
const customOrderRoutes = require('./routes/customOrderRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const couponRoutes      = require('./routes/couponRoutes');
const paymentRoutes     = require('./routes/paymentRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const customizationRoutes = require('./routes/customizationRoutes');

app.get('/', (req, res) => res.json({ message: '🌟 Elegance Fashion API is running' }));

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/banners',       bannerRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/coupons',         couponRoutes);
app.use('/api/payments',        paymentRoutes);
app.use('/api/reviews',         reviewRoutes);
app.use('/api/customizations',  customizationRoutes);

// ─── Error Handlers ──────────────────────────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// ─── DB + Server ─────────────────────────────────────────────────────────────
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const seedDatabase = require('./utils/dbSeeder');

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB Atlas');
        await seedDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 Elegance Fashion API running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
