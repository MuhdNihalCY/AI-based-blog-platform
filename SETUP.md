# AI-Powered Blog Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Git

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration

#### Backend Setup
```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-blog-platform

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI APIs (optional for testing)
GEMINI_API_KEY=your-gemini-api-key-here
STABLE_DIFFUSION_API_KEY=your-stable-diffusion-api-key-here

# Email (optional for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend Setup
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 4. Create Master Admin Account

```bash
cd backend
npm run setup-admin
```

This will create the master admin account with default credentials:
- **Username**: `admin`
- **Password**: `Admin123!`

### 5. Start the Application

```bash
# From root directory
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000).

### 6. Access the Platform

- **Admin Dashboard**: http://localhost:3000/admin
- **Public Blog**: http://localhost:3000/blog
- **API Documentation**: http://localhost:5000/api

## 🔧 Configuration Options

### AI Integration (Optional)

#### Gemini Pro API
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `GEMINI_API_KEY` in `.env`

#### Stable Diffusion API
1. Get API key from [Stability AI](https://platform.stability.ai/)
2. Add to `STABLE_DIFFUSION_API_KEY` in `.env`

### Email Configuration (Optional)

For password reset functionality:
1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Update SMTP settings in `.env`

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: option buffermaxentries is not supported
```
**Solution**: The connection options have been updated. Use the latest `.env` configuration.

#### 2. Nodemailer Error
```
nodemailer.createTransporter is not a function
```
**Solution**: This has been fixed. The correct method is `createTransport`.

#### 3. Frontend Build Errors
```
Invalid next.config.js options detected
```
**Solution**: The `appDir` option has been removed as it's now default in Next.js 14.

#### 4. Port Already in Use
```
Port 3000 is in use, trying 3001 instead
```
**Solution**: This is normal. The frontend will automatically use the next available port.

### Development Tips

1. **Check Logs**: Monitor the terminal output for both backend and frontend
2. **Database**: Ensure MongoDB is running and accessible
3. **Environment**: Verify all required environment variables are set
4. **Dependencies**: Make sure all packages are installed correctly

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/posts` - List all posts
- `GET /api/admin/media` - List media files
- `GET /api/admin/analytics` - Analytics data

### Automation Endpoints
- `POST /api/automation/generate` - Generate AI content
- `POST /api/automation/generate-ideas` - Generate content ideas
- `POST /api/automation/generate-image` - Generate AI images

### Blog Endpoints
- `GET /api/blog/posts` - Public blog posts
- `GET /api/blog/posts/:slug` - Single blog post
- `GET /api/blog/categories` - Blog categories
- `GET /api/blog/search` - Search posts

## 🔒 Security Notes

1. **Change Default Credentials**: Update the master admin password after first login
2. **Environment Variables**: Never commit `.env` files to version control
3. **JWT Secret**: Use a strong, random JWT secret in production
4. **API Keys**: Keep AI API keys secure and monitor usage
5. **HTTPS**: Use HTTPS in production environments

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS settings
4. Set up HTTPS
5. Use environment-specific configuration
6. Set up monitoring and logging
7. Configure backup strategies

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Verify your environment configuration
4. Ensure all dependencies are installed
5. Check MongoDB connection status

The platform is now ready to use! 🎉
