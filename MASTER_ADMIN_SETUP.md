# Master Admin Setup & Authentication Guide

## 🔐 Master Admin Account

### Default Credentials
- **Username**: `admin`
- **Email**: `admin@aiblogplatform.com`
- **Password**: `Admin@2024!`
- **Role**: `super_admin`

### Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure:
   - MongoDB connection string
   - JWT secret key
   - SMTP settings for email notifications

3. **Create Master Admin Account**
   ```bash
   npm run setup-admin
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```

5. **Login to Admin Dashboard**
   - Go to: http://localhost:3000/admin/login
   - Use the default credentials above
   - **IMPORTANT**: Change the password immediately after first login!

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character (@$!%*?&)

### Account Protection
- **Account Lockout**: 5 failed attempts = 2-hour lock
- **Login Tracking**: All login attempts are logged
- **Security Notifications**: Email alerts for suspicious activity

### Password Reset System
- **Email OTP**: 6-digit code sent via email
- **10-minute Expiry**: OTP expires after 10 minutes
- **3 Attempt Limit**: Maximum 3 attempts per OTP
- **5-minute Cooldown**: Wait 5 minutes between requests

## 📧 Email Configuration

### SMTP Settings (Required for Password Reset)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Email Templates Included
- **Password Reset**: Professional OTP email with security warnings
- **Welcome Email**: Welcome message for new users
- **Account Locked**: Security alert for locked accounts
- **New Login Alert**: Notification for new login attempts

## 🛡️ Security Best Practices

### After First Login
1. **Change Default Password**: Use a strong, unique password
2. **Update Email**: Change the default email address
3. **Enable 2FA**: If available, enable two-factor authentication
4. **Review Security Settings**: Check account security preferences

### Regular Maintenance
1. **Monitor Login Activity**: Check for suspicious login attempts
2. **Update Password Regularly**: Change password every 90 days
3. **Review Security Logs**: Monitor security event logs
4. **Keep Email Updated**: Ensure email is current for password resets

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences
- `POST /api/auth/logout` - User logout

### Security Headers
- **CORS**: Configured for security
- **Helmet**: Security headers enabled
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: All inputs validated and sanitized

## 🚨 Troubleshooting

### Common Issues

**Email Not Sending**
- Check SMTP configuration in `.env`
- Verify email credentials
- Check firewall/network settings

**OTP Not Working**
- Check email spam folder
- Verify email address is correct
- Wait 5 minutes between requests

**Account Locked**
- Wait 2 hours for automatic unlock
- Use "Forgot Password" feature
- Contact support if needed

**Login Issues**
- Verify username/email is correct
- Check password requirements
- Ensure account is active

### Support
- Check application logs in `backend/logs/`
- Review security event logs
- Contact support with error details

## 📋 Quick Reference

### Master Admin Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your settings
npm run setup-admin
npm run dev
```

### Default Login
- URL: http://localhost:3000/admin/login
- Username: `admin`
- Password: `Admin@2024!`

### Password Reset
1. Click "Forgot Password" on login page
2. Enter email address
3. Check email for 6-digit OTP
4. Enter OTP and new password
5. Login with new password

---

**⚠️ Security Notice**: Always change the default password immediately after first login and keep your credentials secure!
