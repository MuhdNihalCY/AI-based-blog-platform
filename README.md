# AI-Based Automated Blog Platform

A fully automated, self-monetizing blog platform powered by AI. Generate content, images, and revenue automatically while you sleep.

## 🚀 Features

- **AI-Powered Content Generation** - Automatically generate high-quality blog posts using Gemini Pro API
- **AI Image Creation** - Generate relevant images for your content using Stable Diffusion
- **SEO Optimization** - Built-in SEO tools and optimization for maximum search visibility
- **Passive Income** - Monetize through affiliate links, ads, and other revenue streams
- **Analytics Dashboard** - Comprehensive analytics to track performance and revenue
- **Automated Scheduling** - Schedule content generation and publishing
- **Responsive Design** - Mobile-friendly with dark mode support
- **Security** - JWT authentication with account protection

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt
- **Winston Logging**
- **Rate Limiting** and Security Middleware

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** with custom design system
- **React Query** for data fetching
- **React Hook Form** for form handling
- **Framer Motion** for animations

### AI Integration
- **Gemini Pro API** for content generation
- **Stable Diffusion API** for image creation
- **Dynamic prompt system** with variables

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Gemini Pro API key
- Stable Diffusion API key (optional)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-based-automated-blog
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 3. Environment Setup

#### Backend Environment
Copy the example environment file and configure it:

```bash
cd backend
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-blog-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# AI API Configuration
GEMINI_API_KEY=your-gemini-api-key-here
STABLE_DIFFUSION_API_KEY=your-stable-diffusion-api-key-here

# Other configurations...
```

#### Frontend Environment
Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Development Servers

```bash
# Start both backend and frontend in development mode
npm run dev

# Or start them separately:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

### 5. Setup Master Admin Account

First, create the master admin account:

```bash
cd backend
npm run setup-admin
```

This will create the master admin account with the following credentials:
- **Username**: `admin`
- **Email**: `admin@aiblogplatform.com`
- **Password**: `Admin@2024!`

⚠️ **Important**: Change the default password immediately after first login!

### 6. Access the Application

- **Landing Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/login
- **Public Blog**: http://localhost:3000/blog
- **API Documentation**: http://localhost:5000/health

## 📁 Project Structure

```
AI-based-automated-blog/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── logs/               # Application logs
│   └── uploads/            # File uploads
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── stores/        # State management
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── docs/                  # Documentation
└── DEVELOPMENT_LOG.md     # Development progress tracking
```

## 🔧 Configuration

### AI Content Generation

Configure your AI prompts in the admin dashboard:

1. **Content Prompts**: Set up templates for different content types
2. **Image Prompts**: Configure image generation styles and preferences
3. **Topics & Keywords**: Manage your content themes and SEO keywords

### Monetization Setup

1. **Affiliate Links**: Add your affiliate programs and keywords
2. **Ad Networks**: Configure Google AdSense or other ad networks
3. **Analytics**: Set up Google Analytics tracking

### Automation Settings

1. **Content Schedule**: Set frequency for automated content generation
2. **Publishing Rules**: Configure when and how content is published
3. **Quality Controls**: Set minimum word counts and content standards

## 🚀 Deployment

### Backend Deployment

The backend can be deployed to:
- **Vercel** (recommended for Next.js integration)
- **Railway**
- **Render**
- **Heroku**
- **DigitalOcean App Platform**

### Frontend Deployment

The frontend can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Render**

### Database

Use MongoDB Atlas for production database hosting.

## 📊 Monitoring & Analytics

- **Application Logs**: Comprehensive logging with Winston
- **Performance Metrics**: Built-in analytics dashboard
- **Error Tracking**: Automatic error logging and monitoring
- **Content Analytics**: Track post performance and engagement

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Account lockout protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Development Log**: See `DEVELOPMENT_LOG.md` for progress updates

## 🎯 Roadmap

- [ ] AI content generation service implementation
- [ ] Admin dashboard interface
- [ ] Public blog frontend
- [ ] Image generation integration
- [ ] Monetization features
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support

---

**Built with ❤️ for passive income generation**


<!-- SkmXgwUHRg1cocY2

mnihalcy

mongodb+srv://mnihalcy:SkmXgwUHRg1cocY2@blogs.sgcaosz.mongodb.net/?retryWrites=true&w=majority&appName=blogs -->