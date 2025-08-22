'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import GenerationProgress from '@/components/admin/GenerationProgress';

interface GenerationJob {
  id: string;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  generationTime?: number;
  tokensUsed?: number;
  hasImage?: boolean;
  error?: string;
}

interface GenerationFormData {
  count: number;
  topics: string[];
  categories: string[];
  generateImages: boolean;
  publishImmediately: boolean;
}

const defaultCategories = ['AI', 'Technology', 'Automation', 'Programming', 'Marketing', 'Business'];

export default function ContentGeneration() {
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  const [formData, setFormData] = useState<GenerationFormData>({
    count: 3,
    topics: [''],
    categories: ['AI', 'Technology'],
    generateImages: true,
    publishImmediately: false,
  });
  
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check AI service status
  const { data: serviceStatus, error: serviceError, isLoading: serviceLoading } = useQuery({
    queryKey: ['ai-service-status'],
    queryFn: async () => {
      console.log('🔍 [FRONTEND] Fetching service status...');
      try {
        const response = await api.get('/admin/generation-status');
        console.log('✅ [FRONTEND] Service status response:', response);
        console.log('📊 [FRONTEND] Service status data:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ [FRONTEND] Service status error:', error);
        console.error('❌ [FRONTEND] Error response:', error.response);
        throw error;
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Debug logging for service status
  console.log('🔍 [FRONTEND] Current serviceStatus:', serviceStatus);
  console.log('🔍 [FRONTEND] Service error:', serviceError);
  console.log('🔍 [FRONTEND] Service loading:', serviceLoading);

  const generateContentMutation = useMutation({
    mutationFn: async (data: GenerationFormData) => {
      const response = await api.post('/admin/generate-content', {
        count: data.count,
        topics: data.topics.filter(t => t.trim()),
        categories: data.categories,
        generateImages: data.generateImages,
        publishImmediately: data.publishImmediately,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const jobs: GenerationJob[] = data.data.posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        status: 'completed',
        generationTime: post.generationTime,
        tokensUsed: post.tokensUsed,
        hasImage: post.hasImage,
      }));
      
      // Add any errors as failed jobs
      if (data.data.errors) {
        data.data.errors.forEach((error: any) => {
          jobs.push({
            id: `error-${error.index}`,
            title: error.topic,
            status: 'failed',
            error: error.error,
          });
        });
      }
      
      setGenerationJobs(jobs);
      toast.success(`Generated ${data.data.postsGenerated} blog post(s) successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    },
  });

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const updateTopic = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => i === index ? value : topic)
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceStatus?.data?.aiService?.enabled) {
      toast.error('AI service is not available. Please check your configuration.');
      return;
    }
    
    if (formData.topics.filter(t => t.trim()).length === 0) {
      toast.error('Please provide at least one topic');
      return;
    }
    
    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    setGenerationJobs([]);
    generateContentMutation.mutate(formData);
  };

  const getStatusIcon = (status: GenerationJob['status']) => {
    switch (status) {
      case 'generating':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const totalGenerationTime = generationJobs
    .filter(job => job.generationTime)
    .reduce((sum, job) => sum + (job.generationTime || 0), 0);
    
  const totalTokensUsed = generationJobs
    .filter(job => job.tokensUsed)
    .reduce((sum, job) => sum + (job.tokensUsed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Content Generation</h1>
        <p className="text-gray-600">Generate high-quality blog posts manually or manage automatic generation</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manual Generation
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'auto'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Automatic Generation
          </button>
        </nav>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
        {(() => {
          console.log('🔍 [FRONTEND] Rendering service status section');
          console.log('🔍 [FRONTEND] serviceStatus object:', serviceStatus);
          console.log('🔍 [FRONTEND] serviceStatus.data:', serviceStatus?.data);
          console.log('🔍 [FRONTEND] aiService:', serviceStatus?.data?.aiService);
          console.log('🔍 [FRONTEND] imageService:', serviceStatus?.data?.imageService);
          console.log('🔍 [FRONTEND] aiService.enabled:', serviceStatus?.data?.aiService?.enabled);
          console.log('🔍 [FRONTEND] imageService.enabled:', serviceStatus?.data?.imageService?.enabled);
          return null;
        })()}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${serviceStatus?.data?.aiService?.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">AI Content Generation</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              serviceStatus?.data?.aiService?.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {serviceStatus?.data?.aiService?.enabled ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${serviceStatus?.data?.imageService?.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">Image Generation</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              serviceStatus?.data?.imageService?.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {serviceStatus?.data?.imageService?.enabled ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-gray-700">Primary Image Source</span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {serviceStatus?.data?.imageService?.primarySource || 'Stock Images'}
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Content Generation Settings</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Number of Posts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Posts to Generate
              </label>
              <select
                value={formData.count}
                onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} post{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Leave empty to use AI-generated topics, or specify your own topics
              </p>
              {formData.topics.map((topic, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateTopic(index, e.target.value)}
                    placeholder={`Topic ${index + 1} (e.g., "AI-powered content creation strategies")`}
                    className="flex-1 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {formData.topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              {formData.topics.length < formData.count && (
                <button
                  type="button"
                  onClick={addTopic}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Another Topic
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {defaultCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.categories.includes(category)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                Advanced Settings
                <svg className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="generateImages"
                      checked={formData.generateImages}
                      onChange={(e) => setFormData(prev => ({ ...prev, generateImages: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="generateImages" className="ml-2 text-sm text-gray-700">
                      Generate featured images for posts
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="publishImmediately"
                      checked={formData.publishImmediately}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishImmediately: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="publishImmediately" className="ml-2 text-sm text-gray-700">
                      Publish immediately (default: save as draft)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {(() => {
              const isDisabled = generateContentMutation.isPending || !serviceStatus?.data?.aiService?.enabled;
              console.log('🔍 [FRONTEND] Button disabled state:', isDisabled);
              console.log('🔍 [FRONTEND] generateContentMutation.isPending:', generateContentMutation.isPending);
              console.log('🔍 [FRONTEND] serviceStatus?.data?.aiService?.enabled:', serviceStatus?.data?.aiService?.enabled);
              return null;
            })()}
            <button
              type="submit"
              disabled={generateContentMutation.isPending || !serviceStatus?.data?.aiService?.enabled}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generateContentMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating Content...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Generate Content
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generation Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Generation Results</h3>
          
          {generationJobs.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No content generated yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Fill out the form and click "Generate Content" to get started
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {generationJobs.filter(job => job.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {Math.round(totalGenerationTime / 1000)}s
                  </div>
                  <div className="text-xs text-gray-600">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalTokensUsed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Tokens Used</div>
                </div>
              </div>

              {/* Job List */}
              <div className="space-y-3">
                {generationJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(job.status)}
                          <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                        </div>
                        
                        {job.status === 'completed' && (
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {job.generationTime && (
                              <span>⏱️ {Math.round(job.generationTime / 1000)}s</span>
                            )}
                            {job.tokensUsed && (
                              <span>🔤 {job.tokensUsed.toLocaleString()} tokens</span>
                            )}
                            {job.hasImage && (
                              <span className="flex items-center gap-1">
                                <PhotoIcon className="h-3 w-3" />
                                Image
                              </span>
                            )}
                          </div>
                        )}
                        
                        {job.status === 'failed' && job.error && (
                          <p className="text-sm text-red-600 mt-2">{job.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        </div>
      ) : (
        <GenerationProgress />
      )}
    </div>
  );
}