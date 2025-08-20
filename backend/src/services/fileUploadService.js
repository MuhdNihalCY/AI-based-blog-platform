const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const logger = require('../utils/logger');
const Media = require('../models/Media');

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov'];
    this.allowedDocTypes = ['application/pdf', 'text/plain', 'application/msword'];
    
    this.ensureUploadDir();
    this.setupMulter();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'documents'), { recursive: true });
    } catch (error) {
      logger.error('Error creating upload directories:', error);
    }
  }

  setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        let subDir = 'documents';
        if (file.mimetype.startsWith('image/')) subDir = 'images';
        else if (file.mimetype.startsWith('video/')) subDir = 'videos';
        
        cb(null, path.join(this.uploadDir, subDir));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = [
        ...this.allowedImageTypes,
        ...this.allowedVideoTypes,
        ...this.allowedDocTypes
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
      }
    };

    this.upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize
      }
    });
  }

  getUploadMiddleware() {
    return this.upload.array('files', 10); // Allow up to 10 files
  }

  async processUploadedFiles(files, userId) {
    const processedFiles = [];

    for (const file of files) {
      try {
        const mediaData = {
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/${this.getSubDir(file.mimetype)}/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
          uploadedBy: userId,
          metadata: {
            source: 'upload'
          }
        };

        // Set category based on mimetype
        if (file.mimetype.startsWith('image/')) {
          mediaData.category = 'image';
          // Get image dimensions
          try {
            const metadata = await sharp(file.path).metadata();
            mediaData.metadata.width = metadata.width;
            mediaData.metadata.height = metadata.height;
          } catch (error) {
            logger.warn('Could not get image metadata:', error.message);
          }
        } else if (file.mimetype.startsWith('video/')) {
          mediaData.category = 'video';
        } else {
          mediaData.category = 'document';
        }

        const media = new Media(mediaData);
        await media.save();
        processedFiles.push(media);

        logger.info(`File uploaded: ${file.originalname} by user ${userId}`);
      } catch (error) {
        logger.error(`Error processing file ${file.originalname}:`, error);
        // Clean up file if database save failed
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error('Error cleaning up failed upload:', unlinkError);
        }
      }
    }

    return processedFiles;
  }

  getSubDir(mimetype) {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    return 'documents';
  }

  async deleteFile(mediaId, userId) {
    try {
      const media = await Media.findById(mediaId);
      if (!media) {
        throw new Error('Media not found');
      }

      // Check if user owns the file or is admin
      if (media.uploadedBy.toString() !== userId) {
        // Additional check for admin permissions would go here
        throw new Error('Unauthorized to delete this file');
      }

      // Delete physical file
      const filePath = path.join(this.uploadDir, media.url.replace('/uploads/', ''));
      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn('Physical file not found, continuing with database deletion:', error.message);
      }

      // Delete from database
      await Media.findByIdAndDelete(mediaId);
      logger.info(`File deleted: ${media.filename} by user ${userId}`);

      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  async generateThumbnail(mediaId) {
    try {
      const media = await Media.findById(mediaId);
      if (!media || media.category !== 'image') {
        throw new Error('Media not found or not an image');
      }

      const originalPath = path.join(this.uploadDir, media.url.replace('/uploads/', ''));
      const thumbnailPath = path.join(
        path.dirname(originalPath),
        'thumb_' + media.filename
      );

      await sharp(originalPath)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      const thumbnailUrl = media.url.replace(media.filename, 'thumb_' + media.filename);
      
      return thumbnailUrl;
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async getStorageStats() {
    try {
      const stats = await Media.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        }
      ]);

      const totalStats = await Media.aggregate([
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        }
      ]);

      return {
        byCategory: stats,
        total: totalStats[0] || { totalFiles: 0, totalSize: 0 }
      };
    } catch (error) {
      logger.error('Error getting storage stats:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
