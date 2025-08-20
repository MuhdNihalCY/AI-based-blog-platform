'use client';

import { formatDistanceToNow } from 'date-fns';
import { EyeIcon, ClockIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Post {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  analytics: {
    views: number;
  };
  author?: {
    username: string;
  };
}

interface RecentPostsProps {
  posts: Post[];
}

const statusConfig = {
  published: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Published'
  },
  draft: {
    icon: DocumentTextIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Draft'
  },
  scheduled: {
    icon: ClockIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Scheduled'
  }
};

export default function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Posts</h3>
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first blog post.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Posts</h3>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {posts.map((post) => {
              const status = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft;
              const StatusIcon = status.icon;
              
              return (
                <li key={post._id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full ${status.bgColor} flex items-center justify-center`}>
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
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
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {post.analytics.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="/admin/posts"
            className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            View all posts
          </a>
        </div>
      </div>
    </div>
  );
}
