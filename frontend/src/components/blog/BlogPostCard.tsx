'use client';

import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  author: {
    username: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  categories: string[];
  tags: string[];
  publishDate: string;
  readingTime: number;
  wordCount: number;
  analytics: {
    views: number;
  };
}

interface BlogPostCardProps {
  post: Post;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const authorName = post.author.profile 
    ? `${post.author.profile.firstName || ''} ${post.author.profile.lastName || ''}`.trim()
    : post.author.username;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {category}
              </span>
            ))}
            {post.categories.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{post.categories.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <EyeIcon className="h-4 w-4" />
            <span>{post.analytics.views.toLocaleString()}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Date and Read More */}
        <div className="flex items-center justify-between">
          <time className="text-sm text-gray-500">
            {formatDate(post.publishDate)}
          </time>
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
