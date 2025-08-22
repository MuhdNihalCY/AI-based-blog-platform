const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');
const aiService = require('./aiService');
const imageService = require('./imageService');
const logger = require('../utils/logger');
const slugify = require('slugify');

class ContentScheduler {
  constructor() {
    this.isRunning = false;
    this.currentJob = null;
    this.generationLogs = [];
    this.maxLogs = 100;
    this.isGenerating = false;
    this.currentProgress = {
      total: 0,
      completed: 0,
      status: 'idle',
      logs: [],
      startTime: null,
      endTime: null
    };
  }

  /**
   * Start the automated content scheduler (runs every hour)
   */
  start() {
    if (this.isRunning) {
      logger.warn('Content scheduler is already running');
      return;
    }

    // Schedule to run every hour at minute 0
    this.currentJob = cron.schedule('0 * * * *', async () => {
      await this.generateAutomaticContent();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.currentJob.start();
    this.isRunning = true;
    this.addLog('info', 'Content scheduler started - will generate content every hour');
    logger.info('Content scheduler started');
  }

  /**
   * Stop the automated content scheduler
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Content scheduler is not running');
      return;
    }

    if (this.currentJob) {
      this.currentJob.stop();
      this.currentJob = null;
    }

    this.isRunning = false;
    this.addLog('info', 'Content scheduler stopped');
    logger.info('Content scheduler stopped');
  }

  /**
   * Get current scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isGenerating: this.isGenerating,
      nextRun: this.isRunning ? this.getNextRunTime() : null,
      lastRun: this.getLastRunTime(),
      progress: this.currentProgress
    };
  }

  /**
   * Get generation logs
   */
  getLogs(limit = 50) {
    return this.generationLogs
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear generation logs
   */
  clearLogs() {
    this.generationLogs = [];
    this.addLog('info', 'Generation logs cleared');
  }

  /**
   * Add a log entry
   */
  addLog(level, message, data = null) {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };

    this.generationLogs.push(logEntry);
    this.currentProgress.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.generationLogs.length > this.maxLogs) {
      this.generationLogs.shift();
    }

    // Use appropriate logger method based on level
    switch (level) {
      case 'error':
        logger.error(`ContentScheduler: ${message}`, data);
        break;
      case 'warn':
        logger.warn(`ContentScheduler: ${message}`, data);
        break;
      case 'info':
        logger.info(`ContentScheduler: ${message}`, data);
        break;
      default:
        logger.info(`ContentScheduler: ${message}`, data);
    }
  }

  /**
   * Generate content automatically (called by cron job)
   */
  async generateAutomaticContent() {
    if (this.isGenerating) {
      this.addLog('warn', 'Content generation already in progress, skipping this run');
      return;
    }

    try {
      // Get a random admin user to attribute posts to
      const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
      if (!adminUser) {
        this.addLog('error', 'No admin user found for automatic content generation');
        return;
      }

      const topics = this.getRandomTopics();
      const categories = this.getRandomCategories();

      await this.triggerManualGeneration({
        count: Math.floor(Math.random() * 2) + 1, // Generate 1-2 posts
        topics,
        categories,
        generateImages: true,
        publishImmediately: true,
        authorId: adminUser._id,
        isAutomatic: true
      });

    } catch (error) {
      this.addLog('error', 'Automatic content generation failed', error.message);
    }
  }

  /**
   * Trigger manual content generation
   */
  async triggerManualGeneration(options = {}) {
    if (this.isGenerating) {
      throw new Error('Content generation is already in progress');
    }

    const {
      count = 1,
      topics = [],
      categories = ['Technology', 'AI', 'Automation'],
      generateImages = true,
      publishImmediately = false,
      authorId,
      isAutomatic = false
    } = options;

    this.isGenerating = true;
    this.currentProgress = {
      total: count,
      completed: 0,
      status: 'generating',
      logs: [],
      startTime: new Date(),
      endTime: null
    };

    const results = {
      successful: 0,
      failed: 0,
      posts: [],
      errors: []
    };

    try {
      this.addLog('info', `Starting ${isAutomatic ? 'automatic' : 'manual'} content generation`, {
        count,
        topics,
        categories,
        generateImages,
        publishImmediately
      });

      for (let i = 0; i < count; i++) {
        try {
          this.addLog('info', `Generating post ${i + 1} of ${count}`);

          // Generate content
          const topic = topics.length > 0 ? topics[Math.floor(Math.random() * topics.length)] : this.getRandomTopic();
          const category = categories[Math.floor(Math.random() * categories.length)];

          this.addLog('info', `Generating content for topic: "${topic}" in category: "${category}"`);

          const content = await aiService.generateBlogPost(topic, {
            category,
            wordCount: Math.floor(Math.random() * 1000) + 800, // 800-1800 words
            style: 'informative',
            includeImages: generateImages
          });

          if (!content) {
            throw new Error('Failed to generate content');
          }

          // Validate content has required fields
          if (!content.title || typeof content.title !== 'string') {
            throw new Error('Generated content is missing title');
          }

          if (!content.content || typeof content.content !== 'string') {
            throw new Error('Generated content is missing content body');
          }

          this.addLog('info', `Content generated successfully: "${content.title}"`);

          // Generate or fetch image
          let featuredImage = null;
          if (generateImages) {
            try {
              this.addLog('info', 'Generating featured image');
              const imageResult = await imageService.getBlogImage(content.title, {
                style: 'professional',
                category: category.toLowerCase()
              });

              if (imageResult && imageResult.url) {
                featuredImage = imageResult;
                this.addLog('info', `Featured image generated from ${imageResult.source}`);
              }
            } catch (imageError) {
              this.addLog('warn', 'Failed to generate featured image', imageError.message);
            }
          }

          // Create post with safe slug generation
          let slug;
          try {
            slug = slugify(content.title, { lower: true, strict: true });
            if (!slug || slug.trim() === '') {
              // Fallback slug if slugify fails
              slug = `post-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            }
          } catch (slugError) {
            this.addLog('warn', 'Slugify failed, using fallback slug', slugError.message);
            slug = `post-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          }
          const uniqueSlug = await this.generateUniqueSlug(slug);

          const postData = {
            title: content.title,
            slug: uniqueSlug,
            content: content.content,
            excerpt: content.excerpt,
            category,
            tags: content.tags || [],
            author: authorId,
            status: publishImmediately ? 'published' : 'draft',
            seo: content.seo || {},
            featuredImage,
            automation: {
              isGenerated: true,
              generatedAt: new Date(),
              topic,
              imageSource: featuredImage ? featuredImage.source : null,
              imageQuery: featuredImage ? featuredImage.query : null
            }
          };

          const post = new Post(postData);
          await post.save();

          results.successful++;
          results.posts.push({
            id: post._id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            category: post.category
          });

          this.currentProgress.completed++;
          this.addLog('success', `Successfully created post: "${content.title}"`);

        } catch (error) {
          results.failed++;
          results.errors.push({
            index: i + 1,
            error: error.message
          });
          this.addLog('error', `Failed to generate post ${i + 1}`, error.message);
        }
      }

      this.currentProgress.status = 'completed';
      this.currentProgress.endTime = new Date();
      
      const duration = (this.currentProgress.endTime - this.currentProgress.startTime) / 1000;
      this.addLog('info', `Content generation completed in ${duration}s`, {
        successful: results.successful,
        failed: results.failed,
        total: count
      });

    } catch (error) {
      this.currentProgress.status = 'error';
      this.currentProgress.endTime = new Date();
      this.addLog('error', 'Content generation process failed', error.message);
      throw error;
    } finally {
      this.isGenerating = false;
    }

    return results;
  }

  /**
   * Generate a unique slug
   */
  async generateUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let counter = 1;

    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Get random topics for automatic generation
   */
  getRandomTopics() {
    const topics = [
      'The Future of Artificial Intelligence',
      'Machine Learning in Everyday Life',
      'Blockchain Technology Explained',
      'Cybersecurity Best Practices',
      'Cloud Computing Trends',
      'Internet of Things (IoT) Applications',
      'Data Science and Analytics',
      'Digital Transformation Strategies',
      'Remote Work Technologies',
      'Sustainable Technology Solutions',
      'Mobile App Development Trends',
      'Web Development Best Practices',
      'DevOps and Automation',
      'Tech Startup Insights',
      'Programming Language Comparisons',
      'Software Architecture Patterns',
      'Database Design Principles',
      'API Development Guide',
      'Tech Industry News Analysis',
      'Innovation in Technology'
    ];

    // Return 2-4 random topics
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = topics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get a single random topic
   */
  getRandomTopic() {
    const topics = this.getRandomTopics();
    return topics[Math.floor(Math.random() * topics.length)];
  }

  /**
   * Get random categories
   */
  getRandomCategories() {
    const categories = [
      'Technology',
      'AI & Machine Learning',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Cybersecurity',
      'Cloud Computing',
      'DevOps',
      'Blockchain',
      'IoT',
      'Programming',
      'Software Engineering',
      'Tech Trends',
      'Digital Innovation',
      'Automation'
    ];

    // Return 2-3 random categories
    const count = Math.floor(Math.random() * 2) + 2;
    const shuffled = categories.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get next run time (approximate)
   */
  getNextRunTime() {
    if (!this.isRunning) return null;
    
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  }

  /**
   * Get last run time from logs
   */
  getLastRunTime() {
    const lastAutomaticRun = this.generationLogs
      .filter(log => log.message.includes('automatic') && log.level === 'info')
      .pop();
    
    return lastAutomaticRun ? lastAutomaticRun.timestamp : null;
  }
}

// Create singleton instance
const contentScheduler = new ContentScheduler();

module.exports = contentScheduler;