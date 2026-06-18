const express = require('express');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/agents
// @desc    Get all agents with workload stats
// @access  Private
router.get('/agents', protect, async (req, res) => {
  try {
    const agents = await User.find({ role: 'AGENT' }).select('name email role');
    
    // Calculate workload for each agent
    const agentsWithWorkload = await Promise.all(
      agents.map(async (agent) => {
        const activeComplaintsCount = await Complaint.countDocuments({
          agent: agent._id,
          status: { $in: ['Pending', 'In Progress'] }
        });
        return {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          role: agent.role,
          activeComplaintsCount
        };
      })
    );

    res.json({ success: true, agents: agentsWithWorkload });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update a user's role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('ADMIN'), async (req, res) => {
  const { role } = req.body;

  if (!role || !['USER', 'AGENT', 'ADMIN'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
