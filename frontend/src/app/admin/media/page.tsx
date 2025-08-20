'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  mimetype: string;
  size: number;
  category: string;
  uploadedBy: {
    username: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  uploadedAt: string;
  usageCount: number;
  metadata?: {
    width?: number;
    height?: number;
    aiPrompt?: string;
    source?: string;
    photographer?: string;
    attribution?: string;
  };
  tags: string[];
}

interface MediaResponse {
  mediaFiles: MediaFile[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  storageStats: {
    byCategory: Array<{
      _id: string;
      count: number;
      totalSize: number;
    }>;
    total: {
      totalFiles: number;
      totalSize: number;
    };
  };
}

const typeFilters = [
  { value: 'all', label: 'All Files' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'Documents' },
  { value: 'other', label: 'Other' },
];

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();

  const { data: mediaResponse, isLoading, error } = useQuery<MediaResponse>({
    queryKey: ['admin-media', searchTerm, typeFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(typeFilter !== 'all' && { category: typeFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await api.get(`/admin/media?${params}`);
      return response.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success(`Successfully uploaded ${data.data.length} file(s)`);
      setShowUpload(false);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload files');
      setUploadProgress(0);
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await api.post('/admin/media/ai-generate', {
        prompt,
        style: 'photography',
        width: 1024,
        height: 1024,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('AI image generated successfully');
      setShowAIGenerate(false);
      setAiPrompt('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate AI image');
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/admin/media/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('File deleted successfully');
      setDeleteFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  });

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return PhotoIcon;
    if (mimetype.startsWith('video/')) return VideoCameraIcon;
    if (mimetype.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSourceBadge = (file: MediaFile) => {
    const source = file.metadata?.source;
    if (source === 'ai_generated') return { text: 'AI Generated', color: 'bg-purple-100 text-purple-800' };
    if (source === 'unsplash') return { text: 'Stock Photo', color: 'bg-green-100 text-green-800' };
    if (source === 'upload') return { text: 'Uploaded', color: 'bg-blue-100 text-blue-800' };
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading media files</p>
      </div>
    );
  }

  const { mediaFiles = [], pagination, storageStats } = mediaResponse || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">
            Manage your uploaded files and media • {storageStats?.total.totalFiles || 0} files • {formatFileSize(storageStats?.total.totalSize || 0)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAIGenerate(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <SparklesIcon className="h-5 w-5" />
            AI Generate
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            Upload Files
          </button>
        </div>
      </div>

      {/* Storage Stats */}
      {storageStats?.byCategory && storageStats.byCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storageStats.byCategory.map((stat) => (
              <div key={stat._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">{stat._id}s</span>
                  <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(stat.totalSize)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {typeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-lg shadow">
        {mediaFiles.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
            <p className="text-gray-600 mb-4">Upload some files to get started</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowAIGenerate(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <SparklesIcon className="h-5 w-5" />
                AI Generate
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Upload Files
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {mediaFiles.map((file: MediaFile) => {
                const FileIcon = getFileIcon(file.mimetype);
                const sourceBadge = getSourceBadge(file);
                return (
                  <div key={file._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                      {file.mimetype.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <FileIcon className="h-16 w-16 text-gray-400" />
                      )}
                      {sourceBadge && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${sourceBadge.color}`}>
                          {sourceBadge.text}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 truncate" title={file.originalName}>
                        {file.originalName}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatFileSize(file.size)} • {file.mimetype}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        By {file.uploadedBy.username} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                      {file.usageCount > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Used {file.usageCount} time(s)
                        </p>
                      )}
                      {file.metadata?.aiPrompt && (
                        <p className="text-xs text-purple-600 mt-1 truncate" title={file.metadata.aiPrompt}>
                          Prompt: {file.metadata.aiPrompt}
                        </p>
                      )}
                      {file.metadata?.photographer && (
                        <p className="text-xs text-green-600 mt-1 truncate">
                          Photo by {file.metadata.photographer}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => setDeleteFile(file)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} files
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-indigo-600">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">Drag & drop files here, or click to select</p>
                  <p className="text-xs text-gray-500">
                    Supports: Images, Videos, PDFs, Text files (max 10MB each)
                  </p>
                </>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUpload(false)}
                disabled={uploadMutation.isPending}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIGenerate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Generate AI Image</h3>
              <button
                onClick={() => setShowAIGenerate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the image you want to generate
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., A beautiful landscape with mountains and a lake at sunset"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <p className="text-xs text-gray-500">
                The AI will generate a high-quality image based on your description. This may take a few moments.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAIGenerate(false)}
                disabled={aiGenerateMutation.isPending}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => aiPrompt.trim() && aiGenerateMutation.mutate(aiPrompt.trim())}
                disabled={!aiPrompt.trim() || aiGenerateMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {aiGenerateMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">File Details</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedFile.mimetype.startsWith('image/') && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.originalName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">File Name:</span>
                  <p className="text-gray-600">{selectedFile.originalName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">File Size:</span>
                  <p className="text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-600">{selectedFile.mimetype}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Uploaded:</span>
                  <p className="text-gray-600">{new Date(selectedFile.uploadedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Uploaded By:</span>
                  <p className="text-gray-600">{selectedFile.uploadedBy.username}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Usage Count:</span>
                  <p className="text-gray-600">{selectedFile.usageCount}</p>
                </div>
                {selectedFile.metadata?.width && selectedFile.metadata?.height && (
                  <div>
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <p className="text-gray-600">{selectedFile.metadata.width} × {selectedFile.metadata.height}</p>
                  </div>
                )}
              </div>
              
              {selectedFile.metadata?.aiPrompt && (
                <div>
                  <span className="font-medium text-gray-700">AI Prompt:</span>
                  <p className="text-gray-600 bg-purple-50 p-3 rounded-lg">{selectedFile.metadata.aiPrompt}</p>
                </div>
              )}
              
              {selectedFile.metadata?.photographer && (
                <div>
                  <span className="font-medium text-gray-700">Attribution:</span>
                  <p className="text-gray-600 bg-green-50 p-3 rounded-lg">
                    Photo by {selectedFile.metadata.photographer}
                    {selectedFile.metadata.attribution && ` - ${selectedFile.metadata.attribution}`}
                  </p>
                </div>
              )}
              
              {selectedFile.tags && selectedFile.tags.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFile.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedFile.url);
                  toast.success('URL copied to clipboard');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={() => deleteFile && deleteFileMutation.mutate(deleteFile._id)}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteFile?.originalName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        color="red"
        isLoading={deleteFileMutation.isPending}
      />
    </div>
  );
}