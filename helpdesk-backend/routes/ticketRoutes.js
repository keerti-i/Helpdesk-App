const express = require('express');

const router = express.Router();
const { createTicket, getUserTickets,getTicketMessages, addTicketMessage,getAssignedTickets, updateTicketStatus } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTicket);        // POST /api/tickets
router.get('/', protect, getUserTickets);       // GET /api/tickets
router.get('/:id/chat', protect, getTicketMessages);      // Get chat messages
router.post('/:id/chat', protect, addTicketMessage);      // Send message
router.get('/assigned', protect, getAssignedTickets); // Agent ticket list
router.put('/:id/status', protect, updateTicketStatus); // Update status

const Ticket = require('../models/Ticket');

// Return all tickets (Admin only)
router.get('/all', protect, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'User') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const query = req.user.role === 'Admin'
      ? {} // all tickets
      : { createdBy: req.user._id }; // only user's own tickets

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
