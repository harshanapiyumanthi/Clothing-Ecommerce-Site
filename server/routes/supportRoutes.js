const express = require('express');
const router = express.Router();
const { 
    createTicket, 
    getMyTickets, 
    replyToTicket, 
    getAllTickets, 
    updateTicket 
} = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTicket)
    .get(protect, admin, getAllTickets);

router.route('/my-tickets').get(protect, getMyTickets);

router.route('/:id')
    .put(protect, admin, updateTicket);

router.route('/:id/reply').post(protect, replyToTicket);

module.exports = router;
