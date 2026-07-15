const express = require('express');
const router = express.Router();
const {
    getOptions,
    createOption,
    updateOption,
    deleteOption
} = require('../controllers/customizationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getOptions)
    .post(protect, admin, createOption);

router.route('/:id')
    .put(protect, admin, updateOption)
    .delete(protect, admin, deleteOption);

module.exports = router;
