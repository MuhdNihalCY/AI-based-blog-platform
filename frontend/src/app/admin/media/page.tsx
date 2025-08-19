'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  PhotoIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatFileSize, formatDate } from '@/lib/utils';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedBy: {
    username: string;
  };
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    aiPrompt?: string;
  };
}

export default function MediaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
  const queryClient = useQueryClient();

  const { data: mediaFiles, isLoading } = useQuery<MediaFile[]>({
    queryKey: ['admin-media'],
    queryFn: () => api.get('/admin/media').then(res => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => api.delete(`/admin/media/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media']);
      toast.success('File deleted successfully');
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    },
  });

  const filteredFiles = mediaFiles?.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'images' && file.mimetype.startsWith('image/')) ||
                       (typeFilter === 'documents' && file.mimetype.startsWith('application/'));
    return matchesSearch && matchesType;
  }) || [];

  const handleDelete = (file: MediaFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteMutation.mutate(fileToDelete._id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // TODO: Implement file upload functionality
      toast.info('File upload functionality to be implemented');
    }
  };

  const isImage = (mimetype: string) => mimetype.startsWith('image/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your uploaded images, documents, and media files.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Upload Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredFiles.length} of {mediaFiles?.length || 0} files
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || typeFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by uploading your first file.'
              }
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <div key={file._id} className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* File Preview */}
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    {isImage(file.mimetype) ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">{file.mimetype}</p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(file.uploadedAt)}
                    </p>
                    {file.metadata?.aiPrompt && (
                      <p className="text-xs text-purple-600 mt-1 truncate">
                        AI Generated
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors duration-200"
                      >
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors duration-200"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.originalName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        loading={deleteMutation.isLoading}
      />
    </div>
  );
}
