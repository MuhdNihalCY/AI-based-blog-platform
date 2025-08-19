'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  categories: string[];
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  categories: string[];
  tags: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export default function PostModal({ post, isOpen, onClose, onSave }: PostModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const isEditing = !!post;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: 'draft',
      categories: [],
      tags: [],
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
      },
    },
  });

  const watchedTitle = watch('title');

  useEffect(() => {
    if (post) {
      setValue('title', post.title);
      setValue('content', post.content);
      setValue('excerpt', post.excerpt);
      setValue('status', post.status);
      setValue('categories', post.categories);
      setValue('tags', post.tags);
      setValue('seo.metaTitle', post.seo?.metaTitle || '');
      setValue('seo.metaDescription', post.seo?.metaDescription || '');
      setValue('seo.keywords', post.seo?.keywords || []);
    }
  }, [post, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: PostFormData) => {
      if (isEditing) {
        return api.put(`/admin/posts/${post._id}`, data);
      } else {
        return api.post('/admin/posts', data);
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Post updated successfully' : 'Post created successfully');
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save post');
    },
  });

  const onSubmit = (data: PostFormData) => {
    saveMutation.mutate(data);
  };

  const tabs = [
    { id: 'content', name: 'Content', current: activeTab === 'content' },
    { id: 'seo', name: 'SEO', current: activeTab === 'seo' },
    { id: 'settings', name: 'Settings', current: activeTab === 'settings' },
  ];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      {isEditing ? 'Edit Post' : 'Create New Post'}
                    </Dialog.Title>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                      <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              tab.current
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {tab.name}
                          </button>
                        ))}
                      </nav>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Content Tab */}
                      {activeTab === 'content' && (
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                              Title
                            </label>
                            <input
                              type="text"
                              {...register('title', { required: 'Title is required' })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Enter post title"
                            />
                            {errors.title && (
                              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                              Excerpt
                            </label>
                            <textarea
                              {...register('excerpt')}
                              rows={3}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Brief description of the post"
                            />
                          </div>

                          <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                              Content
                            </label>
                            <textarea
                              {...register('content', { required: 'Content is required' })}
                              rows={12}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Write your post content here..."
                            />
                            {errors.content && (
                              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SEO Tab */}
                      {activeTab === 'seo' && (
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                              Meta Title
                            </label>
                            <input
                              type="text"
                              {...register('seo.metaTitle')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="SEO title for search engines"
                            />
                          </div>

                          <div>
                            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                              Meta Description
                            </label>
                            <textarea
                              {...register('seo.metaDescription')}
                              rows={3}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Brief description for search engines"
                            />
                          </div>

                          <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                              Keywords
                            </label>
                            <input
                              type="text"
                              {...register('seo.keywords')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="keyword1, keyword2, keyword3"
                            />
                          </div>
                        </div>
                      )}

                      {/* Settings Tab */}
                      {activeTab === 'settings' && (
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              {...register('status')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="scheduled">Scheduled</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                              Categories
                            </label>
                            <input
                              type="text"
                              {...register('categories')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Technology, AI, Programming"
                            />
                          </div>

                          <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                              Tags
                            </label>
                            <input
                              type="text"
                              {...register('tags')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="ai, automation, blog"
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saveMutation.isLoading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saveMutation.isLoading ? (
                            <LoadingSpinner size="sm" className="text-white" />
                          ) : (
                            isEditing ? 'Update Post' : 'Create Post'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
