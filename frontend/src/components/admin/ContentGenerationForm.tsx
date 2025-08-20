'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface ContentGenerationFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  serviceStatus?: any;
}

interface FormData {
  count: number;
  topics: string;
  categories: string[];
  keywords: string;
  style: 'informative' | 'conversational' | 'professional';
  wordCount: number;
  generateImages: boolean;
  publishImmediately: boolean;
  imageStyle: 'photography' | 'digital-art' | 'cartoon' | 'minimalist' | 'vintage' | 'modern';
}

export default function ContentGenerationForm({ onSubmit, isLoading, serviceStatus }: ContentGenerationFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      count: 1,
      topics: '',
      categories: ['Technology'],
      keywords: '',
      style: 'informative',
      wordCount: 800,
      generateImages: true,
      publishImmediately: false,
      imageStyle: 'photography',
    },
  });

  const watchedGenerateImages = watch('generateImages');
  const watchedCategories = watch('categories');

  const categories = [
    'Technology',
    'AI & Machine Learning',
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Cybersecurity',
    'Business',
    'Marketing',
    'Lifestyle',
    'Health & Fitness',
    'Travel',
    'Food & Cooking',
    'Education',
    'Entertainment',
  ];

  const styles = [
    { value: 'informative', label: 'Informative', description: 'Educational and fact-based content' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly and engaging tone' },
    { value: 'professional', label: 'Professional', description: 'Formal and authoritative tone' },
  ];

  const imageStyles = [
    { value: 'photography', label: 'Photography', description: 'Realistic photographic style' },
    { value: 'digital-art', label: 'Digital Art', description: 'Modern digital artwork' },
    { value: 'cartoon', label: 'Cartoon', description: 'Fun and colorful cartoon style' },
    { value: 'minimalist', label: 'Minimalist', description: 'Clean and simple design' },
    { value: 'vintage', label: 'Vintage', description: 'Retro and classic aesthetic' },
    { value: 'modern', label: 'Modern', description: 'Contemporary design style' },
  ];

  const handleFormSubmit = (data: FormData) => {
    const formattedData = {
      ...data,
      topics: data.topics.split(',').map(t => t.trim()).filter(t => t.length > 0),
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700">
              Number of Posts
            </label>
            <select
              {...register('count', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} post{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="publishImmediately" className="flex items-center">
              <input
                type="checkbox"
                {...register('publishImmediately')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Publish Immediately</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Otherwise posts will be saved as drafts</p>
          </div>
        </div>

        <div>
          <label htmlFor="topics" className="block text-sm font-medium text-gray-700">
            Topics (comma-separated)
          </label>
          <textarea
            {...register('topics')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., The Future of AI, Machine Learning Applications, Blockchain Technology"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for random topics. System will pick from your list for each post.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  value={category}
                  {...register('categories')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700">
            Writing Style
          </label>
          <select
            {...register('style')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {styles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            {...register('keywords')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., AI, healthcare, machine learning, automation"
          />
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${
              showAdvanced ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700">
                Word Count
              </label>
              <select
                {...register('wordCount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={500}>500 words</option>
                <option value={800}>800 words</option>
                <option value={1000}>1000 words</option>
                <option value={1500}>1500 words</option>
                <option value={2000}>2000 words</option>
              </select>
            </div>

            <div>
              <label htmlFor="generateImages" className="flex items-center">
                <input
                  type="checkbox"
                  {...register('generateImages')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Generate Featured Images</span>
              </label>
            </div>
          </div>

          {watchedGenerateImages && (
            <div>
              <label htmlFor="imageStyle" className="block text-sm font-medium text-gray-700">
                Image Style
              </label>
              <select
                {...register('imageStyle')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {imageStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Service Status */}
      {serviceStatus && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Service Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Content Generation</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                serviceStatus.ai?.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {serviceStatus.ai?.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Image Generation</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                serviceStatus.image?.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {serviceStatus.image?.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </button>
      </div>
    </form>
  );
}
