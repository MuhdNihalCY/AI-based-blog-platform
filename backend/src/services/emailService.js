const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      this.transporter = nodemailer.createTransport(smtpConfig);
      
      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('SMTP connection failed:', error);
        } else {
          logger.info('SMTP server is ready to send emails');
        }
      });

    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendPasswordResetEmail(email, otp, username) {
    if (!this.transporter) {
      throw new Error('Email service not initialized. Please check SMTP configuration.');
    }

    const mailOptions = {
      from: `"AI Blog Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - AI Blog Platform',
      html: this.generatePasswordResetEmailHTML(otp, username),
      text: this.generatePasswordResetEmailText(otp, username)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, username) {
    if (!this.transporter) {
      throw new Error('Email service not initialized. Please check SMTP configuration.');
    }

    const mailOptions = {
      from: `"AI Blog Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to AI Blog Platform',
      html: this.generateWelcomeEmailHTML(username),
      text: this.generateWelcomeEmailText(username)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  generatePasswordResetEmailHTML(otp, username) {
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
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            
            <p>We received a request to reset your password for your AI Blog Platform account.</p>
            
            <div class="otp-box">
              ${otp}
            </div>
            
            <p><strong>Your One-Time Password (OTP) is: ${otp}</strong></p>
            
            <p>Please enter this OTP in the password reset form to complete the process.</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>The AI Blog Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailText(otp, username) {
    return `
Password Reset Request - AI Blog Platform

Hello ${username},

We received a request to reset your password for your AI Blog Platform account.

Your One-Time Password (OTP) is: ${otp}

Please enter this OTP in the password reset form to complete the process.

IMPORTANT:
- This OTP is valid for 10 minutes only
- Do not share this OTP with anyone
- If you didn't request this reset, please ignore this email

If you have any questions or need assistance, please contact our support team.

Best regards,
The AI Blog Platform Team

---
This is an automated message. Please do not reply to this email.
    `;
  }

  generateWelcomeEmailHTML(username) {
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
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10B981; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to AI Blog Platform!</h1>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            
            <p>Welcome to the AI Blog Platform! Your account has been successfully created and you're now ready to start generating amazing content.</p>
            
            <h3>🚀 What you can do now:</h3>
            
            <div class="feature">
              <strong>🤖 AI Content Generation</strong><br>
              Generate high-quality blog posts automatically using advanced AI
            </div>
            
            <div class="feature">
              <strong>🎨 AI Image Creation</strong><br>
              Create stunning visuals for your content with AI-powered image generation
            </div>
            
            <div class="feature">
              <strong>📊 Analytics Dashboard</strong><br>
              Monitor your blog's performance and track your success
            </div>
            
            <div class="feature">
              <strong>💰 Monetization Tools</strong><br>
              Set up affiliate links and ads to generate passive income
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Configure your AI API keys in the settings</li>
              <li>Set up your blog preferences</li>
              <li>Start generating your first automated content</li>
            </ol>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Happy blogging!<br>The AI Blog Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeEmailText(username) {
    return `
Welcome to AI Blog Platform!

Hello ${username},

Welcome to the AI Blog Platform! Your account has been successfully created and you're now ready to start generating amazing content.

What you can do now:

🤖 AI Content Generation
Generate high-quality blog posts automatically using advanced AI

🎨 AI Image Creation
Create stunning visuals for your content with AI-powered image generation

📊 Analytics Dashboard
Monitor your blog's performance and track your success

💰 Monetization Tools
Set up affiliate links and ads to generate passive income

Next Steps:
1. Configure your AI API keys in the settings
2. Set up your blog preferences
3. Start generating your first automated content

If you have any questions or need help getting started, don't hesitate to reach out to our support team.

Happy blogging!
The AI Blog Platform Team

---
This is an automated message. Please do not reply to this email.
    `;
  }

  isEnabled() {
    return this.transporter !== null;
  }
}

module.exports = new EmailService();
