const express = require('express');
const { check, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback for a resolved/closed complaint
// @access  Private/User
router.post(
  '/',
  protect,
  authorize('USER'),
  [
    check('complaintId', 'Complaint ID is required').not().isEmpty(),
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { complaintId, rating, comment } = req.body;

    try {
      // Find complaint
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      // Check if complaint belongs to this user
      if (complaint.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to leave feedback on this complaint' });
      }

      // Check if complaint is resolved or closed
      if (!['Resolved', 'Closed'].includes(complaint.status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Feedback can only be submitted for Resolved or Closed complaints' 
        });
      }

      // Check if feedback already exists
      const existingFeedback = await Feedback.findOne({ complaint: complaintId });
      if (existingFeedback) {
        return res.status(400).json({ success: false, message: 'Feedback has already been submitted' });
      }

      // Create feedback
      const feedback = new Feedback({
        complaint: complaintId,
        user: req.user.id,
        rating,
        comment
      });

      await feedback.save();

      res.status(201).json({ success: true, feedback });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error during feedback creation' });
    }
  }
);

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics (average ratings, all reviews)
// @access  Private/Admin
router.get('/stats', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const reviews = await Feedback.find({})
      .populate('user', 'name email')
      .populate('complaint', 'title category')
      .sort({ createdAt: -1 });

    const totalFeedbacks = reviews.length;

    // Calculate average rating
    const averageRating = totalFeedbacks > 0 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedbacks).toFixed(1)
      : 0;

    // Calculate rating counts (1 to 5 stars)
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalFeedbacks,
        averageRating: Number(averageRating),
        ratingBreakdown
      },
      reviews
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server error fetching feedback stats' });
  }
});

module.exports = router;
