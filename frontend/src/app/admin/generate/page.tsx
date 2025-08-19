'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ContentGenerationForm from '@/components/admin/ContentGenerationForm';
import GenerationStatus from '@/components/admin/GenerationStatus';

interface GenerationFormData {
  topic: string;
  category: string;
  keywords: string[];
  style: 'informative' | 'conversational' | 'professional';
  wordCount: number;
  generateImage: boolean;
  imageStyle: 'photography' | 'digital-art' | 'cartoon' | 'minimalist' | 'vintage' | 'modern';
}

interface GenerationResult {
  post: {
    id: string;
    title: string;
    slug: string;
    status: string;
    wordCount: number;
    readingTime: number;
  };
  generation: {
    contentTime: number;
    imageTime: number;
    totalTokens: number;
    imageGenerated: boolean;
  };
}

export default function ContentGenerationPage() {
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  const { data: serviceStatus } = useQuery({
    queryKey: ['automation-status'],
    queryFn: () => api.get('/automation/status').then(res => res.data.data),
    refetchInterval: 30000,
  });

  const generationMutation = useMutation({
    mutationFn: (data: GenerationFormData) => 
      api.post('/automation/generate', data).then(res => res.data.data),
    onMutate: () => {
      setGenerationStatus('generating');
      toast.loading('Generating content...', { id: 'generation' });
    },
    onSuccess: (data: GenerationResult) => {
      setGenerationStatus('completed');
      setGenerationResult(data);
      toast.success('Content generated successfully!', { id: 'generation' });
    },
    onError: (error: any) => {
      setGenerationStatus('error');
      toast.error(error.response?.data?.message || 'Failed to generate content', { id: 'generation' });
    },
  });

  const handleGenerate = (data: GenerationFormData) => {
    generationMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Generation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Use AI to automatically generate high-quality blog posts with images.
        </p>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${serviceStatus.ai.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-600">AI Content Generation</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                serviceStatus.ai.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {serviceStatus.ai.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${serviceStatus.image.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-600">Image Generation</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                serviceStatus.image.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {serviceStatus.image.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Generation Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-medium text-gray-900">Generate New Content</h2>
          </div>
          
          <ContentGenerationForm 
            onSubmit={handleGenerate}
            isLoading={generationStatus === 'generating'}
            serviceStatus={serviceStatus}
          />
        </div>
      </div>

      {/* Generation Status */}
      {generationStatus !== 'idle' && (
        <GenerationStatus 
          status={generationStatus}
          result={generationResult}
          onReset={() => {
            setGenerationStatus('idle');
            setGenerationResult(null);
          }}
        />
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Generate Ideas</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <PhotoIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Generate Image</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClockIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Schedule Posts</span>
          </button>
        </div>
      </div>
    </div>
  );
}
