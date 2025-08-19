const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('SMTP connection error:', error);
        } else {
          logger.info('SMTP server is ready to send emails');
        }
      });

    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    try {
      const mailOptions = {
        from: `"${process.env.BLOG_TITLE || 'AI Blog Platform'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return info;

    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordResetOTP(email, otp, userName = 'User') {
    const subject = 'Password Reset Request - AI Blog Platform';
    const html = this.generatePasswordResetEmail(otp, userName);
    
    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, userName) {
    const subject = 'Welcome to AI Blog Platform';
    const html = this.generateWelcomeEmail(userName);
    
    return this.sendEmail(email, subject, html);
  }

  async sendAccountLockedEmail(email, userName) {
    const subject = 'Account Security Alert - AI Blog Platform';
    const html = this.generateAccountLockedEmail(userName);
    
    return this.sendEmail(email, subject, html);
  }

  async sendNewLoginAlert(email, userName, loginInfo) {
    const subject = 'New Login Detected - AI Blog Platform';
    const html = this.generateNewLoginAlert(userName, loginInfo);
    
    return this.sendEmail(email, subject, html);
  }

  generatePasswordResetEmail(otp, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>AI Blog Platform</p>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your AI Blog Platform account.</p>
            
            <div class="otp-box">
              <p><strong>Your verification code is:</strong></p>
              <div class="otp-code">${otp}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <p>Please enter this code in the password reset form to complete the process.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This code is valid for 10 minutes only</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for this code</li>
              </ul>
            </div>
            
            <p>If you have any questions or concerns, please contact our support team.</p>
            
            <p>Best regards,<br>The AI Blog Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 AI Blog Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeEmail(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Blog Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: #fff; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to AI Blog Platform!</h1>
            <p>Your automated blogging journey begins now</p>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Welcome to AI Blog Platform! We're excited to have you on board and help you create a successful, automated blog that generates passive income.</p>
            
            <h3>🚀 What you can do now:</h3>
            <div class="feature">
              <strong>📝 AI Content Generation:</strong> Automatically create high-quality blog posts
            </div>
            <div class="feature">
              <strong>🎨 AI Image Creation:</strong> Generate relevant images for your content
            </div>
            <div class="feature">
              <strong>💰 Monetization:</strong> Set up affiliate links and ad networks
            </div>
            <div class="feature">
              <strong>📊 Analytics:</strong> Track your blog's performance and revenue
            </div>
            
            <p>Ready to get started? Log in to your admin dashboard and begin configuring your automated blog!</p>
            
            <p>Best regards,<br>The AI Blog Platform Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AI Blog Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateAccountLockedEmail(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Account Security Alert</h1>
            <p>AI Blog Platform</p>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We detected multiple failed login attempts on your AI Blog Platform account. For your security, your account has been temporarily locked.</p>
            
            <div class="warning">
              <strong>🔐 Account Locked:</strong>
              <p>Your account is now locked for 2 hours due to multiple failed login attempts.</p>
            </div>
            
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Wait 2 hours for the lock to automatically expire</li>
              <li>Use the "Forgot Password" feature to reset your password</li>
              <li>Contact support if you need immediate assistance</li>
            </ul>
            
            <p>If this was you, please ensure you're using the correct password. If you've forgotten your password, you can reset it using the forgot password feature.</p>
            
            <p>Best regards,<br>The AI Blog Platform Security Team</p>
          </div>
          <div class="footer">
            <p>This is an automated security alert. Please do not reply to this email.</p>
            <p>&copy; 2024 AI Blog Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateNewLoginAlert(userName, loginInfo) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Detected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #fff; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 New Login Detected</h1>
            <p>AI Blog Platform</p>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We detected a new login to your AI Blog Platform account.</p>
            
            <div class="info-box">
              <strong>Login Details:</strong><br>
              <strong>Time:</strong> ${loginInfo.time}<br>
              <strong>IP Address:</strong> ${loginInfo.ip}<br>
              <strong>Location:</strong> ${loginInfo.location || 'Unknown'}<br>
              <strong>Device:</strong> ${loginInfo.userAgent || 'Unknown'}
            </div>
            
            <p>If this was you, no action is needed. If you don't recognize this login, please:</p>
            <ul>
              <li>Change your password immediately</li>
              <li>Enable two-factor authentication if available</li>
              <li>Contact our support team</li>
            </ul>
            
            <p>Best regards,<br>The AI Blog Platform Security Team</p>
          </div>
          <div class="footer">
            <p>This is an automated security alert. Please do not reply to this email.</p>
            <p>&copy; 2024 AI Blog Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new EmailService();
