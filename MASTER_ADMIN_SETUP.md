# Master Admin Setup Guide

This guide provides instructions for setting up the master admin user and configuring the forgot password feature for the AI Blog Platform.

## 🔐 Master Admin Credentials

The system comes with predefined master admin credentials:

- **Username:** `admin`
- **Email:** `nihalcy1234@gmail.com`
- **Password:** `Admin@2024!`
- **Role:** `super_admin`

## 🚀 Quick Setup

### 1. Environment Configuration

First, ensure your `.env` file in the backend directory contains all necessary configurations:

```bash
# Copy the example environment file
cp backend/env.example backend/.env
```

### 2. Required Environment Variables

Make sure these variables are set in your `backend/.env` file:

```env
# AI Content Generation (REQUIRED for content generation)
GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration (REQUIRED for forgot password feature)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nihalcy1234@gmail.com
SMTP_PASS=cjex jwqn ovlw wupa

# Database Configuration
MONGODB_URI=mongodb+srv://mnihalcy:SkmXgwUHRg1cocY2@blogs.sgcaosz.mongodb.net/?retryWrites=true&w=majority&appName=blogs

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 4. Setup Master Admin

Run the master admin setup script:

```bash
cd backend
npm run setup-admin
```

This will create the master admin user with the predefined credentials.

### 5. Start the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
cd ../frontend
npm run dev
```

## 📧 Forgot Password Feature

The platform includes a secure forgot password feature using SMTP OTP:

### How It Works

1. **Request Password Reset:** User enters their email address
2. **OTP Generation:** System generates a 6-digit OTP
3. **Email Delivery:** OTP is sent via SMTP email
4. **Password Reset:** User enters OTP and new password
5. **Account Update:** Password is updated and OTP is cleared

### Email Templates

The system includes professionally designed email templates:
- **Password Reset Email:** Contains OTP with security warnings
- **Welcome Email:** Sent to new users with platform information

### Security Features

- **6-digit OTP:** Secure random number generation
- **10-minute expiration:** OTP expires after 10 minutes
- **One-time use:** OTP is cleared after successful password reset
- **Rate limiting:** Prevents abuse of the forgot password feature

## 🔧 API Endpoints

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/setup-admin
```

### Forgot Password Flow

1. **Request OTP:**
   ```bash
   POST /api/auth/forgot-password
   {
     "email": "nihalcy1234@gmail.com"
   }
   ```

2. **Reset Password:**
   ```bash
   POST /api/auth/reset-password
   {
     "email": "nihalcy1234@gmail.com",
     "otp": "123456",
     "newPassword": "NewSecurePassword123!"
   }
   ```

## 🛡️ Security Best Practices

### After First Login

1. **Change Default Password:** Immediately change the default password
2. **Update JWT Secret:** Change the JWT_SECRET in your .env file
3. **Secure API Keys:** Ensure all API keys are properly configured
4. **Enable HTTPS:** Use HTTPS in production

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🐛 Troubleshooting

### Common Issues

#### 1. AI Content Generation Unavailable
**Problem:** "AI Content Generation: Unavailable"
**Solution:** 
- Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add it to `GEMINI_API_KEY` in your `.env` file

#### 2. Email Service Not Working
**Problem:** Forgot password emails not sending
**Solution:**
- Verify SMTP settings in `.env` file
- Ensure Gmail app password is correct
- Check firewall/network restrictions

#### 3. Database Connection Error
**Problem:** MongoDB connection fails
**Solution:**
- Verify MONGODB_URI in `.env` file
- Check network connectivity
- Ensure MongoDB service is running

### Logs and Debugging

Check the logs for detailed error information:

```bash
# Backend logs
cd backend
tail -f logs/app.log

# Frontend logs (in browser console)
```

## 📞 Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check the troubleshooting section above

## 🔄 Updates

This setup guide will be updated as new features are added to the platform. Always refer to the latest version for the most current setup instructions.
