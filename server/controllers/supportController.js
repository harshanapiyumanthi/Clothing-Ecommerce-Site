const asyncHandler = require('express-async-handler');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const logActivity = require('../utils/activityLogger');

// @desc    Create new support ticket
// @route   POST /api/support
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
    const { subject, category, message, priority, relatedOrder } = req.body;

    const ticket = await SupportTicket.create({
        user: req.user._id,
        subject,
        category,
        priority: priority || 'Medium',
        relatedOrder: relatedOrder || null,
        messages: [{
            sender: req.user._id,
            isStaff: false,
            message
        }]
    });

    res.status(201).json({ success: true, ticket });
});

// @desc    Get logged in user tickets
// @route   GET /api/support/my-tickets
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({ user: req.user._id })
        .sort({ updatedAt: -1 })
        .lean();
    res.json({ success: true, tickets });
});

// @desc    Reply to a ticket
// @route   POST /api/support/:id/reply
// @access  Private
const replyToTicket = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Is user authorized?
    const isOwner = ticket.user.toString() === req.user._id.toString();
    const isAdmin = ['super_admin', 'admin', 'customer_support'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to reply to this ticket');
    }

    ticket.messages.push({
        sender: req.user._id,
        isStaff: isAdmin && !isOwner,
        message
    });

    if (isAdmin && !isOwner) {
        ticket.status = 'Waiting on Customer';
        // Notify customer
        await Notification.create({
            user: ticket.user,
            title: 'Support Ticket Update',
            message: `New reply on ticket: ${ticket.subject}`,
            type: 'SupportTicket'
        });
    } else {
        ticket.status = 'Open'; // Customer replied
    }

    await ticket.save();
    res.json({ success: true, ticket });
});

// @desc    Get all tickets (Admin)
// @route   GET /api/support
// @access  Private/Admin
const getAllTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({})
        .populate('user', 'name email')
        .populate('assignedStaff', 'name')
        .sort({ updatedAt: -1 })
        .lean();
    res.json({ success: true, tickets });
});

// @desc    Update ticket status/assignment (Admin)
// @route   PUT /api/support/:id
// @access  Private/Admin
const updateTicket = asyncHandler(async (req, res) => {
    const { status, assignedStaff, internalNotes } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    if (status) ticket.status = status;
    if (assignedStaff) ticket.assignedStaff = assignedStaff;
    if (internalNotes !== undefined) ticket.internalNotes = internalNotes;

    await ticket.save();
    
    await logActivity(req, 'Support Ticket Updated', 'SupportTicket', ticket._id, `Status updated to: ${status}`);
    
    res.json({ success: true, ticket });
});

module.exports = {
    createTicket,
    getMyTickets,
    replyToTicket,
    getAllTickets,
    updateTicket
};
