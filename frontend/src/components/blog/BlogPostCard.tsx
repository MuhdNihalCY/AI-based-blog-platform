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
    <article className="group cursor-pointer">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-64 overflow-hidden rounded-xl mb-6">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="space-y-4">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 line-clamp-3 text-lg leading-relaxed">
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="h-3 w-3 text-gray-600" />
              </div>
              <span className="font-medium">{authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
          <time className="text-sm text-gray-500">
            {formatDate(post.publishDate)}
          </time>
        </div>
      </div>
    </article>
  );
}
