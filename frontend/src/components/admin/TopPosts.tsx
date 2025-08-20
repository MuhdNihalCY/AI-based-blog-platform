'use client';

import { formatDistanceToNow } from 'date-fns';
import { EyeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface Post {
  _id: string;
  title: string;
  analytics: {
    views: number;
    revenue: number;
  };
  createdAt: string;
  author?: {
    username: string;
  };
}

interface TopPostsProps {
  posts: Post[];
}

export default function TopPosts({ posts }: TopPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Posts</h3>
        <div className="text-center py-8">
          <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your top performing posts will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Posts</h3>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {posts.map((post, index) => (
              <li key={post._id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {post.author && (
                        <span className="text-xs text-gray-400">
                          by {post.author.username}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {post.analytics.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        ${post.analytics.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="/admin/analytics"
            className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            View detailed analytics
          </a>
        </div>
      </div>
    </div>
  );
}
