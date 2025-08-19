const axios = require('axios');
const logger = require('../utils/logger');

class ImageService {
  constructor() {
    this.apiKey = process.env.STABLE_DIFFUSION_API_KEY;
    this.apiUrl = process.env.STABLE_DIFFUSION_API_URL || 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    this.isEnabled = !!this.apiKey;
    
    if (!this.isEnabled) {
      logger.warn('Stable Diffusion API key not found. Image generation will be disabled.');
    } else {
      logger.info('Image service initialized successfully');
    }
  }

  async generateImage(prompt, options = {}) {
    if (!this.isEnabled) {
      throw new Error('Image generation service not available. Please configure STABLE_DIFFUSION_API_KEY.');
    }

    const startTime = Date.now();
    
    try {
      const {
        width = 1024,
        height = 1024,
        steps = 30,
        cfgScale = 7,
        samples = 1,
        style = 'photography',
        quality = 'standard'
      } = options;

      // Enhance prompt with style
      const enhancedPrompt = this.enhancePrompt(prompt, style);

      const requestBody = {
        text_prompts: [
          {
            text: enhancedPrompt,
            weight: 1
          }
        ],
        cfg_scale: cfgScale,
        height: height,
        width: width,
        samples: samples,
        steps: steps,
        style_preset: this.mapStyleToPreset(style)
      };

      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 60000 // 60 seconds timeout
      });

      const generationTime = Date.now() - startTime;
      
      if (response.data && response.data.artifacts && response.data.artifacts.length > 0) {
        const imageData = response.data.artifacts[0];
        
        logger.info(`Image generated successfully in ${generationTime}ms`);

        return {
          success: true,
          imageData: imageData.base64,
          metadata: {
            generationTime,
            prompt: enhancedPrompt,
            options,
            seed: imageData.seed,
            finishReason: imageData.finishReason
          }
        };
      } else {
        throw new Error('No image data received from API');
      }

    } catch (error) {
      const generationTime = Date.now() - startTime;
      logger.error(`Image generation failed after ${generationTime}ms:`, error);
      
      if (error.response) {
        throw new Error(`Image generation failed: ${error.response.data?.message || error.response.statusText}`);
      } else {
        throw new Error(`Image generation failed: ${error.message}`);
      }
    }
  }

  async generateBlogImage(content, options = {}) {
    const {
      style = 'photography',
      aspectRatio = '16:9',
      includeText = false
    } = options;

    // Extract key elements from content for image generation
    const imagePrompt = this.extractImagePromptFromContent(content, style);
    
    // Set dimensions based on aspect ratio
    const dimensions = this.getDimensionsFromAspectRatio(aspectRatio);
    
    return this.generateImage(imagePrompt, {
      ...options,
      ...dimensions,
      style
    });
  }

  async generateMultipleImages(prompt, count = 3, options = {}) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const result = await this.generateImage(prompt, options);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to generate image ${i + 1}:`, error);
        results.push({
          success: false,
          error: error.message,
          index: i
        });
      }
    }
    
    return results;
  }

  enhancePrompt(prompt, style) {
    let enhancedPrompt = prompt;

    // Add style-specific enhancements
    switch (style) {
      case 'photography':
        enhancedPrompt += ', high quality photography, professional lighting, sharp focus';
        break;
      case 'digital-art':
        enhancedPrompt += ', digital art, vibrant colors, artistic style';
        break;
      case 'cartoon':
        enhancedPrompt += ', cartoon style, colorful, animated';
        break;
      case 'minimalist':
        enhancedPrompt += ', minimalist design, clean lines, simple composition';
        break;
      case 'vintage':
        enhancedPrompt += ', vintage style, retro aesthetic, classic look';
        break;
      case 'modern':
        enhancedPrompt += ', modern design, contemporary style, sleek';
        break;
      default:
        enhancedPrompt += ', high quality, professional';
    }

    // Add quality enhancements
    enhancedPrompt += ', high resolution, detailed, professional quality';

    return enhancedPrompt;
  }

  extractImagePromptFromContent(content, style) {
    // Extract key concepts from content for image generation
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);

    const keyConcepts = [...new Set(words)].join(', ');
    
    return this.enhancePrompt(keyConcepts, style);
  }

  getDimensionsFromAspectRatio(aspectRatio) {
    const baseSize = 1024;
    
    switch (aspectRatio) {
      case '1:1':
        return { width: baseSize, height: baseSize };
      case '16:9':
        return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
      case '4:3':
        return { width: baseSize, height: Math.round(baseSize * 3 / 4) };
      case '3:2':
        return { width: baseSize, height: Math.round(baseSize * 2 / 3) };
      case '9:16':
        return { width: Math.round(baseSize * 9 / 16), height: baseSize };
      default:
        return { width: baseSize, height: baseSize };
    }
  }

  mapStyleToPreset(style) {
    const styleMap = {
      'photography': 'photographic',
      'digital-art': 'digital-art',
      'cartoon': 'anime',
      'minimalist': 'cinematic',
      'vintage': 'cinematic',
      'modern': 'photographic'
    };
    
    return styleMap[style] || 'photographic';
  }

  async testConnection() {
    try {
      if (!this.isEnabled) {
        return { success: false, error: 'Image service not initialized' };
      }

      const testPrompt = 'A simple test image of a blue sky';
      const result = await this.generateImage(testPrompt, { 
        width: 512, 
        height: 512,
        steps: 10 
      });
      
      return { 
        success: true, 
        message: 'Image service is working correctly',
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
      totalImages: 0,
      estimatedCost: 0,
      lastUsed: null
    };
  }

  // Utility method to save image to file system
  async saveImage(imageData, filename) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(imageData, 'base64');
      
      await fs.writeFile(filePath, buffer);
      
      return {
        success: true,
        filePath,
        filename
      };
    } catch (error) {
      logger.error('Failed to save image:', error);
      throw new Error('Failed to save image to file system');
    }
  }

  // Utility method to generate unique filename
  generateFilename(prefix = 'image') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.png`;
  }
}

module.exports = new ImageService();
