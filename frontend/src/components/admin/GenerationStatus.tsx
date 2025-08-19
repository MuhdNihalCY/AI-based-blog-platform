'use client';

import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface GenerationStatusProps {
  status: 'idle' | 'generating' | 'completed' | 'error';
  result?: any;
  onReset: () => void;
}

export default function GenerationStatus({ status, result, onReset }: GenerationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'generating':
        return {
          icon: ClockIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          title: 'Generating Content',
          description: 'AI is creating your blog post and image...',
        };
      case 'completed':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          title: 'Generation Complete',
          description: 'Your content has been successfully generated!',
        };
      case 'error':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          title: 'Generation Failed',
          description: 'There was an error generating your content.',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`rounded-lg border p-6 ${statusConfig.bgColor}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {statusConfig.description}
          </p>

          {status === 'generating' && (
            <div className="mt-4">
              <div className="flex space-x-2">
                <div className="animate-pulse bg-blue-200 rounded-full h-2 w-2"></div>
                <div className="animate-pulse bg-blue-200 rounded-full h-2 w-2" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse bg-blue-200 rounded-full h-2 w-2" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                This may take a few moments...
              </p>
            </div>
          )}

          {status === 'completed' && result && (
            <div className="mt-4 space-y-3">
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Post</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Title:</span>
                    <span className="font-medium">{result.post.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Word Count:</span>
                    <span className="font-medium">{result.post.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading Time:</span>
                    <span className="font-medium">{result.post.readingTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{result.post.status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Generation Stats</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Content Generation:</span>
                    <span className="font-medium">{result.generation.contentTime}ms</span>
                  </div>
                  {result.generation.imageTime > 0 && (
                    <div className="flex justify-between">
                      <span>Image Generation:</span>
                      <span className="font-medium">{result.generation.imageTime}ms</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Total Tokens:</span>
                    <span className="font-medium">{result.generation.totalTokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Image Generated:</span>
                    <span className="font-medium">{result.generation.imageGenerated ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => window.open(`/admin/posts`, '_blank')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All Posts
                </button>
                <button
                  onClick={onReset}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate Another
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <button
                onClick={onReset}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
