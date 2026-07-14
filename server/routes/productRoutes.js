const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');

const productValidation = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    validate,
];

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.array('images', 8), productValidation, createProduct);
router.put('/:id', protect, admin, upload.array('images', 8), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required'),
    validate,
], createProductReview);

module.exports = router;
