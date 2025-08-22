import Link from 'next/link';
import { Metadata } from 'next';
import { 
  FiZap, 
  FiTrendingUp, 
  FiDollarSign, 
  FiBarChart, 
  FiShield, 
  FiGlobe,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'AI Automated Blog Platform - Generate Passive Income with AI',
  description: 'Create a fully automated, self-monetizing blog platform powered by AI. Generate content, images, and revenue automatically.',
};

const features = [
  {
    icon: FiZap,
    title: 'AI-Powered Content Generation',
    description: 'Automatically generate high-quality blog posts using advanced AI technology with Gemini Pro API.',
  },
  {
    icon: FiTrendingUp,
    title: 'SEO Optimization',
    description: 'Built-in SEO tools and optimization to maximize search engine visibility and organic traffic.',
  },
  {
    icon: FiDollarSign,
    title: 'Passive Income',
    description: 'Monetize your blog through affiliate links, ads, and other revenue streams automatically.',
  },
  {
    icon: FiBarChart,
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics to track performance, revenue, and content engagement.',
  },
  {
    icon: FiShield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with JWT authentication and comprehensive error handling.',
  },
  {
    icon: FiGlobe,
    title: 'Global Reach',
    description: 'Optimized for global audiences with responsive design and fast loading times.',
  },
];

const benefits = [
  'Fully automated content generation',
  'AI-powered image creation',
  'Built-in monetization tools',
  'SEO optimization out of the box',
  'Comprehensive analytics',
  'Mobile-responsive design',
  'Dark mode support',
  'Real-time notifications',
  'Scheduled publishing',
  'Multi-user support',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                AI Blog Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Admin Login
              </Link>
              <Link 
                href="/blog" 
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                View Blog
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Generate{' '}
            <span className="text-blue-600">Passive Income</span>
            <br />
            with AI-Powered Blogging
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create a fully automated, self-monetizing blog platform that generates content, 
            images, and revenue while you sleep. Powered by cutting-edge AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admin/register" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg font-medium inline-flex items-center"
            >
              Get Started Free
              <FiArrowRight className="ml-2" />
            </Link>
            <Link 
              href="/blog" 
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium"
            >
              View Demo Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our platform provides all the tools and features you need to create a 
              successful, automated blog that generates passive income.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our AI-powered platform is designed to maximize your success with 
                automated content generation, SEO optimization, and monetization tools.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <FiCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Start?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Join thousands of bloggers who are already generating passive income 
                  with our AI-powered platform.
                </p>
                <Link 
                  href="/admin/register" 
                  className="btn-primary w-full"
                >
                  Create Your Blog Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Blog Platform</h3>
              <p className="text-gray-400">
                The future of automated content creation and passive income generation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Public Blog</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Content Generation</li>
                <li>Image Creation</li>
                <li>SEO Optimization</li>
                <li>Monetization Tools</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Blog Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
