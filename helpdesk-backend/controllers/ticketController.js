const Ticket = require('../models/Ticket');
const Category = require('../models/Category');


// Create ticket with auto-assigned agent
const createTicket = async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find the category document to get assigned agent
    const categoryDoc = await Category.findOne({ name: category });

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const ticket = await Ticket.create({
      title,
      description,
      category,
      createdBy: req.user._id,
      assignedTo: categoryDoc.assignedAgent || null, // auto-assign if present
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all tickets created by the logged-in user
const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user._id });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get chat messages for a ticket
const getTicketMessages = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('messages.sender', 'name role')
      .exec();

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Only creator or assigned agent can view
    if (
      !ticket.createdBy.equals(req.user._id) &&
      !ticket.assignedTo?.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket.messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a message to ticket chat
const addTicketMessage = async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: 'Text is required' });

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (
      !ticket.createdBy.equals(req.user._id) &&
      !ticket.assignedTo?.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.messages.push({
      sender: req.user._id,
      text,
    });

    await ticket.save();

    res.status(201).json({ message: 'Message added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get tickets assigned to the logged-in agent
const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Update status of a ticket
const updateTicketStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Only assigned agent can update status
    if (!ticket.assignedTo?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    ticket.status = status;
    await ticket.save();

    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { createTicket, getUserTickets,getTicketMessages, addTicketMessage,getAssignedTickets, updateTicketStatus };
