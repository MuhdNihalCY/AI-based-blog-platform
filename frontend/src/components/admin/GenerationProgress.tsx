'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface GenerationLog {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  data?: any;
}

interface GenerationStatus {
  isRunning: boolean;
  isGenerating: boolean;
  nextRun: string | null;
  lastRun: string | null;
  progress: {
    total: number;
    completed: number;
    status: 'idle' | 'generating' | 'completed' | 'error';
    logs: GenerationLog[];
    startTime: string | null;
    endTime: string | null;
  };
}

interface GenerationProgressProps {
  onRefresh?: () => void;
}

export default function GenerationProgress({ onRefresh }: GenerationProgressProps) {
  const { token } = useAuth();
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/generation-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch generation status');
      }

      const data = await response.json();
      setStatus(data.data.status);
      setLogs(data.data.logs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduler = async () => {
    if (!status) return;

    try {
      const endpoint = status.isRunning ? '/api/admin/scheduler/stop' : '/api/admin/scheduler/start';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle scheduler');
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/admin/generation-logs', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear logs');
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getProgressPercentage = () => {
    if (!status?.progress.total) return 0;
    return (status.progress.completed / status.progress.total) * 100;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <PlayIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scheduler Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Automatic Scheduler</h3>
          <button
            onClick={toggleScheduler}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              status?.isRunning
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {status?.isRunning ? 'Stop Scheduler' : 'Start Scheduler'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className={`font-medium ${
              status?.isRunning ? 'text-green-600' : 'text-red-600'
            }`}>
              {status?.isRunning ? 'Running' : 'Stopped'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Run</p>
            <p className="font-medium text-gray-900">
              {formatDate(status?.nextRun)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Run</p>
            <p className="font-medium text-gray-900">
              {formatDate(status?.lastRun)}
            </p>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {status?.isGenerating && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generation Progress</h3>
            <span className="text-sm text-gray-600">
              {status.progress.completed} of {status.progress.total} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{getProgressPercentage().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status.progress.status === 'generating' ? 'bg-blue-500 animate-pulse' :
              status.progress.status === 'completed' ? 'bg-green-500' :
              status.progress.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">
              {status.progress.status}
            </span>
          </div>
        </div>
      )}

      {/* Generation Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Generation Logs</h3>
          <div className="flex space-x-2">
            <button
              onClick={fetchStatus}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Refresh
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No logs available</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
                >
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.data && (
                      <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
