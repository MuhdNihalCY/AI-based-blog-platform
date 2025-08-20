const axios = require('axios');
const logger = require('../utils/logger');

class StockImageService {
  constructor() {
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.unsplashApiUrl = 'https://api.unsplash.com';
    this.isEnabled = !!this.unsplashAccessKey;
    
    if (!this.isEnabled) {
      logger.warn('Unsplash API key not found. Stock image service will be disabled.');
    } else {
      logger.info('Stock image service initialized successfully');
    }
  }

  async searchImages(query, options = {}) {
    if (!this.isEnabled) {
      throw new Error('Stock image service not available. Please configure UNSPLASH_ACCESS_KEY.');
    }

    try {
      const {
        page = 1,
        perPage = 10,
        orientation = 'landscape', // landscape, portrait, squarish
        category = '',
        color = '',
        orderBy = 'relevant' // latest, oldest, popular, relevant
      } = options;

      const params = {
        query,
        page,
        per_page: perPage,
        orientation,
        order_by: orderBy
      };

      if (category) params.category = category;
      if (color) params.color = color;

      const response = await axios.get(`${this.unsplashApiUrl}/search/photos`, {
        params,
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          'Accept-Version': 'v1'
        },
        timeout: 10000
      });

      if (response.data && response.data.results) {
        const images = response.data.results.map(photo => ({
          id: photo.id,
          description: photo.description || photo.alt_description || query,
          urls: {
            raw: photo.urls.raw,
            full: photo.urls.full,
            regular: photo.urls.regular,
            small: photo.urls.small,
            thumb: photo.urls.thumb
          },
          width: photo.width,
          height: photo.height,
          photographer: {
            name: photo.user.name,
            username: photo.user.username,
            profileUrl: photo.user.links.html
          },
          downloadUrl: photo.links.download,
          htmlUrl: photo.links.html,
          tags: photo.tags ? photo.tags.map(tag => tag.title) : [],
          color: photo.color
        }));

        return {
          success: true,
          images,
          total: response.data.total,
          totalPages: response.data.total_pages
        };
      } else {
        throw new Error('No images found');
      }

    } catch (error) {
      logger.error('Stock image search failed:', error);
      
      if (error.response) {
        throw new Error(`Stock image search failed: ${error.response.data?.errors?.[0] || error.response.statusText}`);
      } else {
        throw new Error(`Stock image search failed: ${error.message}`);
      }
    }
  }

  async getRandomImage(query, options = {}) {
    try {
      const searchResults = await this.searchImages(query, { ...options, perPage: 30 });
      
      if (searchResults.images && searchResults.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * searchResults.images.length);
        return {
          success: true,
          image: searchResults.images[randomIndex]
        };
      } else {
        throw new Error('No images found for query');
      }
    } catch (error) {
      logger.error('Random image fetch failed:', error);
      throw error;
    }
  }

  async getBlogImage(content, options = {}) {
    const {
      orientation = 'landscape',
      category = '',
      fallbackQueries = []
    } = options;

    // Extract keywords from content for search
    const primaryQuery = this.extractKeywordsFromContent(content);
    const queries = [primaryQuery, ...fallbackQueries, 'technology', 'business', 'abstract'];

    // Try each query until we find images
    for (const query of queries) {
      try {
        const result = await this.getRandomImage(query, { orientation, category });
        if (result.success) {
          return {
            success: true,
            image: result.image,
            query: query,
            source: 'unsplash'
          };
        }
      } catch (error) {
        logger.warn(`Failed to find images for query "${query}":`, error.message);
        continue;
      }
    }

    throw new Error('No suitable images found for content');
  }

  async downloadImage(imageUrl, filename) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'stream',
        timeout: 30000
      });

      const fs = require('fs');
      const path = require('path');
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      const writer = fs.createWriteStream(filePath);
      
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          resolve({
            success: true,
            filePath,
            filename
          });
        });
        writer.on('error', reject);
      });

    } catch (error) {
      logger.error('Failed to download image:', error);
      throw new Error('Failed to download image');
    }
  }

  extractKeywordsFromContent(content) {
    // Extract meaningful keywords from content
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 3);

    return words.length > 0 ? words.join(' ') : 'technology';
  }

  async getCollectionImages(collectionId, options = {}) {
    if (!this.isEnabled) {
      throw new Error('Stock image service not available.');
    }

    try {
      const { page = 1, perPage = 30 } = options;

      const response = await axios.get(`${this.unsplashApiUrl}/collections/${collectionId}/photos`, {
        params: { page, per_page: perPage },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          'Accept-Version': 'v1'
        }
      });

      const images = response.data.map(photo => ({
        id: photo.id,
        description: photo.description || photo.alt_description,
        urls: photo.urls,
        photographer: {
          name: photo.user.name,
          username: photo.user.username
        }
      }));

      return { success: true, images };

    } catch (error) {
      logger.error('Collection images fetch failed:', error);
      throw new Error(`Failed to fetch collection images: ${error.message}`);
    }
  }

  // Predefined collections for different content types
  getPopularCollections() {
    return {
      technology: '3816141', // Technology collection
      business: '1065976',   // Business collection
      nature: '3330445',     // Nature collection
      abstract: '3348849',   // Abstract collection
      lifestyle: '3356584',  // Lifestyle collection
      education: '4291985',  // Education collection
      health: '4387238',     // Health collection
      finance: '4596824'     // Finance collection
    };
  }

  async testConnection() {
    try {
      if (!this.isEnabled) {
        return { success: false, error: 'Stock image service not initialized' };
      }

      const result = await this.searchImages('test', { perPage: 1 });
      
      return { 
        success: true, 
        message: 'Stock image service is working correctly',
        testResult: result
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  getUsageStats() {
    // This would integrate with actual API usage tracking
    return {
      totalRequests: 0,
      totalDownloads: 0,
      lastUsed: null,
      service: 'Unsplash'
    };
  }

  // Generate attribution text for Unsplash images
  generateAttribution(image) {
    return `Photo by <a href="${image.photographer.profileUrl}?utm_source=AI_Blog_Platform&utm_medium=referral">${image.photographer.name}</a> on <a href="https://unsplash.com/?utm_source=AI_Blog_Platform&utm_medium=referral">Unsplash</a>`;
  }

  // Utility method to generate unique filename
  generateFilename(prefix = 'stock', extension = 'jpg') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }
}

module.exports = new StockImageService();
