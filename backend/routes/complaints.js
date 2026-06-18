const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// @route   POST /api/complaints
// @desc    Submit a new complaint (with auto workload-based routing)
// @access  Private/User
router.post(
  '/',
  protect,
  authorize('USER'),
  upload.single('attachment'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, priority } = req.body;
    let attachmentUrl = '';

    if (req.file) {
      // Store relative path so frontend can access it via static serving
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    try {
      // 1. Workload-based intelligent routing
      const agents = await User.find({ role: 'AGENT' });
      let assignedAgent = null;

      if (agents.length > 0) {
        // Query workload of all agents
        const workloads = await Promise.all(
          agents.map(async (agent) => {
            const activeCount = await Complaint.countDocuments({
              agent: agent._id,
              status: { $in: ['Pending', 'In Progress'] }
            });
            return { agent, activeCount };
          })
        );

        // Sort ascending by count
        workloads.sort((a, b) => a.activeCount - b.activeCount);
        assignedAgent = workloads[0].agent;
      }

      // 2. Create the Complaint
      const complaint = new Complaint({
        title,
        description,
        category,
        priority: priority || 'Medium',
        user: req.user.id,
        agent: assignedAgent ? assignedAgent._id : null,
        attachmentUrl
      });

      await complaint.save();

      // 3. Populate user and agent details for response
      const populatedComplaint = await Complaint.findById(complaint._id)
        .populate('user', 'name email')
        .populate('agent', 'name email');

      // 4. Send Email Notifications
      // Email User
      await sendEmail({
        email: req.user.email,
        subject: `Complaint Registered Successfully: #${complaint._id.toString().substring(18)}`,
        html: `
          <h3>Hello ${req.user.name},</h3>
          <p>Your complaint has been successfully registered in our system.</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Status:</strong> Pending</p>
          <p><strong>Assigned Agent:</strong> ${assignedAgent ? assignedAgent.name : 'Awaiting Assignment'}</p>
          <br>
          <p>Thank you for reaching out. We will get back to you shortly.</p>
        `
      });

      // Email Agent (if assigned)
      if (assignedAgent) {
        await sendEmail({
          email: assignedAgent.email,
          subject: `New Complaint Assigned: #${complaint._id.toString().substring(18)}`,
          html: `
            <h3>Hello ${assignedAgent.name},</h3>
            <p>A new complaint has been auto-assigned to you due to your active queue status.</p>
            <p><strong>Complaint Title:</strong> ${title}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Priority:</strong> ${priority || 'Medium'}</p>
            <br>
            <p>Please log in to your Agent Dashboard to start working on it.</p>
          `
        });
      }

      res.status(201).json({ success: true, complaint: populatedComplaint });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error during complaint creation' });
    }
  }
);

// @route   GET /api/complaints
// @desc    Get all complaints for logged-in user according to role
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Role-based queries
    if (req.user.role === 'USER') {
      query = { user: req.user.id };
    } else if (req.user.role === 'AGENT') {
      query = { agent: req.user.id };
    }
    // ADMIN sees all, so query remains empty

    const complaints = await Complaint.find(query)
      .populate('user', 'name email')
      .populate('agent', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error fetching complaints' });
  }
});

// @route   GET /api/complaints/admin/stats
// @desc    Get system wide statistics for admin dashboard
// @access  Private/Admin
router.get('/admin/stats', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const total = await Complaint.countDocuments({});
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });

    // Category distribution
    const categories = ['Technical', 'Billing', 'General', 'Feedback'];
    const categoryStats = {};
    for (const cat of categories) {
      categoryStats[cat] = await Complaint.countDocuments({ category: cat });
    }

    // Agent list with active complaints
    const agents = await User.find({ role: 'AGENT' }).select('name email');
    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const activeCount = await Complaint.countDocuments({
          agent: agent._id,
          status: { $in: ['Pending', 'In Progress'] }
        });
        const resolvedCount = await Complaint.countDocuments({
          agent: agent._id,
          status: 'Resolved'
        });
        return {
          _id: agent._id,
          name: agent.name,
          activeCount,
          resolvedCount
        };
      })
    );

    res.json({
      success: true,
      stats: {
        total,
        statusCounts: { pending, inProgress, resolved, closed },
        categoryStats,
        agentStats
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error fetching admin stats' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get a specific complaint details and chat messages
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('agent', 'name email')
      .populate('messages.sender', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Access authorization check
    if (
      req.user.role === 'USER' && 
      complaint.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    if (
      req.user.role === 'AGENT' && 
      complaint.agent && 
      complaint.agent._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error fetching complaint details' });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status or re-assign agent
// @access  Private (Agent updates status; Admin updates status / agent)
router.put('/:id', protect, async (req, res) => {
  const { status, agentId } = req.body;

  try {
    let complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('agent', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Role verification
    if (req.user.role === 'USER') {
      // User can only change status to 'Closed' if it was resolved
      if (status === 'Closed' && complaint.status === 'Resolved') {
        complaint.status = 'Closed';
      } else {
        return res.status(403).json({ success: false, message: 'Users can only close resolved complaints' });
      }
    } else if (req.user.role === 'AGENT') {
      // Agent can only update status, and only if assigned to this complaint
      if (complaint.agent && complaint.agent._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized, not your assigned complaint' });
      }
      if (status) {
        complaint.status = status;
      }
    } else if (req.user.role === 'ADMIN') {
      // Admin can update both status and agent assignment
      if (status) {
        complaint.status = status;
      }
      if (agentId !== undefined) {
        // If assigning a new agent (or setting to null)
        if (agentId) {
          const newAgent = await User.findById(agentId);
          if (!newAgent || newAgent.role !== 'AGENT') {
            return res.status(400).json({ success: false, message: 'Invalid agent ID provided' });
          }
          complaint.agent = agentId;

          // Notify new Agent
          await sendEmail({
            email: newAgent.email,
            subject: `Complaint Reassigned: #${complaint._id.toString().substring(18)}`,
            html: `
              <h3>Hello ${newAgent.name},</h3>
              <p>The Admin has reassigned a complaint to your queue.</p>
              <p><strong>Complaint Title:</strong> ${complaint.title}</p>
              <br>
              <p>Please log in to your Agent Dashboard to review it.</p>
            `
          });
        } else {
          complaint.agent = null;
        }
      }
    }

    await complaint.save();

    // Populate for fresh data return
    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('user', 'name email')
      .populate('agent', 'name email');

    // Notify User about status update
    if (status && status !== complaint.status) {
      await sendEmail({
        email: updatedComplaint.user.email,
        subject: `Complaint Status Updated: #${complaint._id.toString().substring(18)}`,
        html: `
          <h3>Hello ${updatedComplaint.user.name},</h3>
          <p>The status of your complaint has been updated.</p>
          <p><strong>Complaint Title:</strong> ${updatedComplaint.title}</p>
          <p><strong>New Status:</strong> <span style="font-weight:bold; color:#4F46E5;">${status}</span></p>
          <br>
          <p>Check your User Dashboard for details or to chat with your agent.</p>
        `
      });
    }

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error during update' });
  }
});

// @route   POST /api/complaints/:id/messages
// @desc    Add a chat message to a complaint
// @access  Private (Participant only)
router.post(
  '/:id/messages',
  protect,
  [check('message', 'Message text cannot be empty').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { message } = req.body;

    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      // Check if authorized participant
      const isCreator = complaint.user.toString() === req.user.id;
      const isAssignedAgent = complaint.agent && complaint.agent.toString() === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isCreator && !isAssignedAgent && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to participate in this chat' });
      }

      // Add message
      const newMessage = {
        sender: req.user.id,
        message,
        createdAt: new Date()
      };

      complaint.messages.push(newMessage);
      await complaint.save();

      // Fetch complaint and populate messages
      const updatedComplaint = await Complaint.findById(req.params.id)
        .populate('messages.sender', 'name role');

      const addedMsg = updatedComplaint.messages[updatedComplaint.messages.length - 1];

      res.json({ success: true, message: addedMsg });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error sending message' });
    }
  }
);

module.exports = router;
