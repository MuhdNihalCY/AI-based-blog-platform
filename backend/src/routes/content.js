const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/content
// @desc    Get all posts with pagination and filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const category = req.query.category;
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.categories = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/:id
// @desc    Get single post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: { post }
    });

  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/content
// @desc    Create new post
// @access  Private
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'scheduled'])
    .withMessage('Status must be draft, published, or scheduled'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      excerpt,
      status = 'draft',
      categories = [],
      tags = [],
      scheduledDate,
      seo = {},
      featuredImage = {}
    } = req.body;

    // Set publish date for scheduled posts
    let publishDate = new Date();
    if (status === 'scheduled' && scheduledDate) {
      publishDate = new Date(scheduledDate);
    }

    const post = new Post({
      title,
      content,
      excerpt,
      status,
      publishDate,
      scheduledDate,
      author: req.user.id,
      categories,
      tags,
      seo,
      featuredImage
    });

    await post.save();

    logger.info(`New post created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });

  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/content/:id
// @desc    Update post
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'scheduled', 'archived'])
    .withMessage('Invalid status'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Update fields
    const updateFields = ['title', 'content', 'excerpt', 'status', 'categories', 'tags', 'seo', 'featuredImage'];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    // Handle scheduled date
    if (req.body.scheduledDate) {
      post.scheduledDate = new Date(req.body.scheduledDate);
      if (post.status === 'scheduled') {
        post.publishDate = post.scheduledDate;
      }
    }

    await post.save();

    logger.info(`Post updated: ${post.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });

  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.remove();

    logger.info(`Post deleted: ${post.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/content/:id/publish
// @desc    Publish a draft post
// @access  Private
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Post is already published'
      });
    }

    post.status = 'published';
    post.publishDate = new Date();
    await post.save();

    logger.info(`Post published: ${post.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Post published successfully',
      data: { post }
    });

  } catch (error) {
    logger.error('Publish post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/content/:id/unpublish
// @desc    Unpublish a published post
// @access  Private
router.post('/:id/unpublish', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Post is not published'
      });
    }

    post.status = 'draft';
    await post.save();

    logger.info(`Post unpublished: ${post.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Post unpublished successfully',
      data: { post }
    });

  } catch (error) {
    logger.error('Unpublish post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
