'use client';

interface Category {
  _id: string;
  count: number;
}

interface BlogSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function BlogSidebar({ categories, selectedCategory, onCategoryChange }: BlogSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors duration-200 ${
                selectedCategory === category._id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{category._id}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                selectedCategory === category._id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500 text-sm">No categories available</p>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Blog</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          This blog is powered by artificial intelligence, automatically generating high-quality content 
          on technology, innovation, and digital trends. Our AI system creates engaging articles with 
          relevant images and SEO optimization.
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>AI-Generated Content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>SEO Optimized</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Regular Updates</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Posts</span>
            <span className="font-semibold text-gray-900">
              {categories.reduce((total, cat) => total + cat.count, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Categories</span>
            <span className="font-semibold text-gray-900">{categories.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Latest Update</span>
            <span className="font-semibold text-gray-900">Today</span>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-indigo-100 text-sm mb-4">
          Get notified when new AI-generated content is published.
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
          <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
