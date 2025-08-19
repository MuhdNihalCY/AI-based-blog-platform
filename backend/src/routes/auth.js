const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const { PASSWORD_REQUIREMENTS, OTP_CONFIG } = require('../config/admin');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new admin user
// @access  Public (but should be restricted in production)
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
    .withMessage(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
    .matches(PASSWORD_REQUIREMENTS.pattern)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName
      }
    });

    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by credentials
    const user = await User.findByCredentials(email, password);

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, bio } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('notifications.dashboard')
    .optional()
    .isBoolean()
    .withMessage('Dashboard notifications must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { theme, notifications } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (theme !== undefined) user.preferences.theme = theme;
    if (notifications) {
      if (notifications.email !== undefined) {
        user.preferences.notifications.email = notifications.email;
      }
      if (notifications.dashboard !== undefined) {
        user.preferences.notifications.dashboard = notifications.dashboard;
      }
    }

    await user.save();

    logger.info(`Preferences updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP via email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset code has been sent.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check for existing unused OTPs
    const existingOTP = await OTP.findOne({
      email: email.toLowerCase(),
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingOTP) {
      const timeDiff = Math.ceil((existingOTP.expiresAt - new Date()) / (1000 * 60));
      if (timeDiff > OTP_CONFIG.cooldownMinutes) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${OTP_CONFIG.cooldownMinutes} minutes before requesting another code.`
        });
      }
    }

    // Create new OTP
    const otpRecord = await OTP.createOTP(
      email.toLowerCase(),
      'password_reset',
      OTP_CONFIG.expiryMinutes
    );

    // Send email
    try {
      await emailService.sendPasswordResetOTP(
        email,
        otpRecord.otp,
        user.profile.firstName || user.username
      );

      logger.info(`Password reset OTP sent to: ${email}`);

      res.json({
        success: true,
        message: 'Password reset code has been sent to your email.'
      });

    } catch (emailError) {
      // Delete the OTP if email fails
      await otpRecord.remove();
      
      logger.error('Failed to send password reset email:', emailError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/verify-reset-otp
// @desc    Verify password reset OTP
// @access  Public
router.post('/verify-reset-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Verify OTP
    const otpRecord = await OTP.verifyOTP(email.toLowerCase(), otp, 'password_reset');

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.'
    });

  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using verified OTP
// @access  Public
router.post('/reset-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
    .withMessage(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
    .matches(PASSWORD_REQUIREMENTS.pattern)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const otpRecord = await OTP.verifyOTP(email.toLowerCase(), otp, 'password_reset');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark OTP as used
    await otpRecord.markAsUsed();

    // Invalidate all other OTPs for this email
    await OTP.invalidateAllOTPs(email.toLowerCase(), 'password_reset');

    logger.info(`Password reset successful for: ${email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
