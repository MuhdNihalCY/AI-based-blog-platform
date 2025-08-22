'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  EyeIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarIcon,
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import BlogPostCard from '@/components/blog/BlogPostCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { processMarkdown } from '@/lib/markdown';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
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
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

interface RelatedPost {
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

interface BlogPostData {
  post: Post;
  relatedPosts: RelatedPost[];
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: blogData, isLoading, error } = useQuery<BlogPostData>({
    queryKey: ['blog-post', slug],
    queryFn: () => api.get(`/blog/posts/${slug}`).then(res => res.data.data),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const { post, relatedPosts } = blogData;
  const authorName = post.author.profile 
    ? `${post.author.profile.firstName || ''} ${post.author.profile.lastName || ''}`.trim()
    : post.author.username;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-12">
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium">{authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <time>{formatDate(post.publishDate)}</time>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{post.analytics.views.toLocaleString()} views</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-gray-50 rounded-xl p-8 mb-8">
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                {post.excerpt}
              </p>
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="mb-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: processMarkdown(post.content) }}
          />
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
            <div className="flex space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost._id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
