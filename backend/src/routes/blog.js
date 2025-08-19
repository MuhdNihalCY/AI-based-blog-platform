const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const Post = require('../models/Post');

const router = express.Router();

// @route   GET /api/blog/posts
// @desc    Get published blog posts for public viewing
// @access  Public
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const sort = req.query.sort || 'newest'; // newest, oldest, popular

    const skip = (page - 1) * limit;

    // Build query for published posts only
    let query = {
      status: 'published',
      publishDate: { $lte: new Date() }
    };

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

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { publishDate: 1 };
        break;
      case 'popular':
        sortOptions = { 'analytics.views': -1 };
        break;
      case 'newest':
      default:
        sortOptions = { publishDate: -1 };
        break;
    }

    const posts = await Post.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-content'); // Don't send full content in list

    const total = await Post.countDocuments(query);

    // Get categories for filtering
    const categories = await Post.aggregate([
      { $match: { status: 'published', publishDate: { $lte: new Date() } } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        },
        categories,
        filters: {
          category,
          search,
          sort
        }
      }
    });

  } catch (error) {
    logger.error('Public blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/posts/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/posts/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      slug,
      status: 'published',
      publishDate: { $lte: new Date() }
    }).populate('author', 'username profile.firstName profile.lastName');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    // Get related posts
    const relatedPosts = await Post.findRelated(post._id, post.tags, 3);

    res.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });

  } catch (error) {
    logger.error('Single post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/categories
// @desc    Get all categories with post counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Post.aggregate([
      { $match: { status: 'published', publishDate: { $lte: new Date() } } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    logger.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/tags
// @desc    Get all tags with post counts
// @access  Public
router.get('/tags', async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $match: { status: 'published', publishDate: { $lte: new Date() } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: tags
    });

  } catch (error) {
    logger.error('Tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/search
// @desc    Search blog posts
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchQuery = {
      status: 'published',
      publishDate: { $lte: new Date() },
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { categories: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const posts = await Post.find(searchQuery)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content');

    const total = await Post.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        posts,
        query,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
