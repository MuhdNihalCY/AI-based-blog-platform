const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    // TODO: Implement dashboard statistics
    res.json({
      success: true,
      message: 'Admin dashboard endpoint - to be implemented',
      data: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        totalRevenue: 0
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
