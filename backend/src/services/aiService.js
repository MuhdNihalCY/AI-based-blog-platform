const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeAI();
  }

  initializeAI() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.warn('Gemini API key not found. AI content generation will be disabled.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      logger.info('AI service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI service:', error);
    }
  }

  async generateContent(prompt, options = {}) {
    if (!this.model) {
      throw new Error('AI service not initialized. Please check your Gemini API key.');
    }

    const startTime = Date.now();
    
    try {
      const {
        maxTokens = 2000,
        temperature = 0.7,
        topP = 0.8,
        topK = 40,
        category = 'general',
        tone = 'professional',
        targetAudience = 'general',
        includeSEO = true,
        wordCount = 800
      } = options;

      // Build enhanced prompt
      const enhancedPrompt = this.buildEnhancedPrompt(prompt, {
        category,
        tone,
        targetAudience,
        includeSEO,
        wordCount
      });

      // Generate content
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
          topP,
          topK,
        },
      });

      const response = await result.response;
      const content = response.text();
      
      const generationTime = Date.now() - startTime;
      const tokenCount = this.estimateTokenCount(enhancedPrompt + content);

      logger.info(`Content generated successfully in ${generationTime}ms, estimated tokens: ${tokenCount}`);

      return {
        content,
        metadata: {
          generationTime,
          estimatedTokens: tokenCount,
          prompt: enhancedPrompt,
          options
        }
      };

    } catch (error) {
      const generationTime = Date.now() - startTime;
      logger.error(`Content generation failed after ${generationTime}ms:`, error);
      throw new Error(`AI content generation failed: ${error.message}`);
    }
  }

  async generateBlogPost(topic, options = {}) {
    const {
      style = 'informative',
      includeIntroduction = true,
      includeConclusion = true,
      includeHeadings = true,
      includeCallToAction = true,
      seoKeywords = [],
      targetWordCount = 800
    } = options;

    const prompt = this.buildBlogPostPrompt(topic, {
      style,
      includeIntroduction,
      includeConclusion,
      includeHeadings,
      includeCallToAction,
      seoKeywords,
      targetWordCount
    });

    return this.generateContent(prompt, { ...options, wordCount: targetWordCount });
  }

  async generateSEOOptimizedContent(topic, keywords = [], options = {}) {
    const seoPrompt = this.buildSEOPrompt(topic, keywords, options);
    return this.generateContent(seoPrompt, { ...options, includeSEO: true });
  }

  async generateContentIdeas(category, count = 5) {
    const prompt = `Generate ${count} engaging blog post ideas for the category "${category}". 
    Each idea should include:
    - A compelling title
    - A brief description (2-3 sentences)
    - Target keywords
    - Estimated word count
    - Content type (how-to, listicle, review, etc.)
    
    Format the response as a JSON array with these fields:
    {
      "title": "Post Title",
      "description": "Brief description",
      "keywords": ["keyword1", "keyword2"],
      "wordCount": 800,
      "type": "how-to"
    }`;

    const result = await this.generateContent(prompt, { 
      maxTokens: 1000, 
      temperature: 0.8,
      wordCount: 200 
    });

    try {
      // Try to parse JSON response
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse manually
      return this.parseContentIdeas(result.content);
    } catch (error) {
      logger.error('Failed to parse content ideas:', error);
      throw new Error('Failed to generate content ideas');
    }
  }

  async generateImagePrompt(content, style = 'photography') {
    const prompt = `Based on this blog content, generate a compelling image prompt for AI image generation.
    
    Content: ${content.substring(0, 500)}...
    
    Style: ${style}
    
    Requirements:
    - Create a detailed, descriptive prompt
    - Include visual elements from the content
    - Specify style and mood
    - Keep it under 100 words
    - Make it suitable for AI image generation
    
    Return only the image prompt, no additional text.`;

    const result = await this.generateContent(prompt, { 
      maxTokens: 200, 
      temperature: 0.6,
      wordCount: 50 
    });

    return result.content.trim();
  }

  buildEnhancedPrompt(basePrompt, options) {
    const {
      category,
      tone,
      targetAudience,
      includeSEO,
      wordCount
    } = options;

    let enhancedPrompt = basePrompt;

    // Add category context
    if (category && category !== 'general') {
      enhancedPrompt += `\n\nCategory: ${category}`;
    }

    // Add tone instructions
    if (tone) {
      enhancedPrompt += `\n\nTone: Write in a ${tone} tone.`;
    }

    // Add audience targeting
    if (targetAudience && targetAudience !== 'general') {
      enhancedPrompt += `\n\nTarget Audience: Write for ${targetAudience}.`;
    }

    // Add SEO instructions
    if (includeSEO) {
      enhancedPrompt += `\n\nSEO Requirements:
      - Use clear, descriptive headings
      - Include relevant keywords naturally
      - Write meta descriptions
      - Optimize for readability
      - Use proper heading hierarchy (H1, H2, H3)`;
    }

    // Add word count requirement
    if (wordCount) {
      enhancedPrompt += `\n\nWord Count: Aim for approximately ${wordCount} words.`;
    }

    // Add quality requirements
    enhancedPrompt += `\n\nQuality Requirements:
    - Write engaging, informative content
    - Use clear, concise language
    - Include practical examples when relevant
    - Ensure factual accuracy
    - Make content actionable and valuable`;

    return enhancedPrompt;
  }

  buildBlogPostPrompt(topic, options) {
    const {
      style,
      includeIntroduction,
      includeConclusion,
      includeHeadings,
      includeCallToAction,
      seoKeywords,
      targetWordCount
    } = options;

    let prompt = `Write a comprehensive blog post about "${topic}".`;

    // Style instructions
    if (style === 'informative') {
      prompt += `\n\nStyle: Write an informative, educational post that provides valuable insights and practical information.`;
    } else if (style === 'conversational') {
      prompt += `\n\nStyle: Write in a conversational, friendly tone that engages readers.`;
    } else if (style === 'professional') {
      prompt += `\n\nStyle: Write in a professional, authoritative tone suitable for business audiences.`;
    }

    // Structure requirements
    if (includeIntroduction) {
      prompt += `\n\nInclude an engaging introduction that hooks the reader.`;
    }

    if (includeHeadings) {
      prompt += `\n\nUse clear, descriptive headings (H2, H3) to organize content.`;
    }

    if (includeConclusion) {
      prompt += `\n\nInclude a strong conclusion that summarizes key points.`;
    }

    if (includeCallToAction) {
      prompt += `\n\nInclude a call-to-action at the end.`;
    }

    // SEO optimization
    if (seoKeywords && seoKeywords.length > 0) {
      prompt += `\n\nNaturally incorporate these keywords: ${seoKeywords.join(', ')}`;
    }

    // Word count
    if (targetWordCount) {
      prompt += `\n\nTarget word count: ${targetWordCount} words.`;
    }

    return prompt;
  }

  buildSEOPrompt(topic, keywords, options) {
    const { targetWordCount = 800 } = options;

    let prompt = `Write an SEO-optimized blog post about "${topic}".`;

    if (keywords && keywords.length > 0) {
      prompt += `\n\nPrimary keywords: ${keywords.join(', ')}`;
    }

    prompt += `\n\nSEO Requirements:
    - Naturally incorporate keywords throughout the content
    - Use keyword-rich headings (H1, H2, H3)
    - Write a compelling meta title (under 60 characters)
    - Write a meta description (under 160 characters)
    - Include internal linking suggestions
    - Optimize for featured snippets
    - Use proper heading hierarchy
    - Target word count: ${targetWordCount} words

    Format the response as:
    ---
    META TITLE: [title]
    META DESCRIPTION: [description]
    ---
    [content]`;

    return prompt;
  }

  parseContentIdeas(content) {
    // Simple parsing fallback
    const ideas = [];
    const lines = content.split('\n');
    
    let currentIdea = {};
    
    for (const line of lines) {
      if (line.includes('Title:') || line.includes('title:')) {
        if (Object.keys(currentIdea).length > 0) {
          ideas.push(currentIdea);
        }
        currentIdea = { title: line.split(':')[1]?.trim() };
      } else if (line.includes('Description:') || line.includes('description:')) {
        currentIdea.description = line.split(':')[1]?.trim();
      } else if (line.includes('Keywords:') || line.includes('keywords:')) {
        const keywords = line.split(':')[1]?.trim();
        currentIdea.keywords = keywords ? keywords.split(',').map(k => k.trim()) : [];
      }
    }
    
    if (Object.keys(currentIdea).length > 0) {
      ideas.push(currentIdea);
    }
    
    return ideas;
  }

  estimateTokenCount(text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  async testConnection() {
    try {
      if (!this.model) {
        return { success: false, error: 'AI service not initialized' };
      }

      const result = await this.model.generateContent('Hello, this is a test.');
      const response = await result.response;
      
      return { 
        success: true, 
        message: 'AI service is working correctly',
        testResponse: response.text()
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
      totalTokens: 0,
      estimatedCost: 0,
      lastUsed: null
    };
  }
}

module.exports = new AIService();
