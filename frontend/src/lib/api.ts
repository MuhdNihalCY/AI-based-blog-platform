import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-storage');
      if (token) {
        try {
          const authData = JSON.parse(token);
          if (authData.state?.token) {
            config.headers.Authorization = `Bearer ${authData.state.token}`;
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const apiClient = {
  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string }) =>
      api.post('/auth/login', data),
    register: (data: { username: string; email: string; password: string }) =>
      api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (data: { email: string }) =>
      api.post('/auth/forgot-password', data),
    resetPassword: (data: { token: string; password: string }) =>
      api.post('/auth/reset-password', data),
    me: () => api.get('/auth/me'),
  },

  // Admin endpoints
  admin: {
    dashboard: () => api.get('/admin/dashboard'),
    analytics: (params?: { period?: string }) =>
      api.get('/admin/analytics', { params }),
    settings: () => api.get('/admin/settings'),
    users: () => api.get('/admin/users'),
    logs: (params?: { level?: string; limit?: number }) =>
      api.get('/admin/logs', { params }),
  },

  // Automation endpoints
  automation: {
    generate: (data: any) => api.post('/automation/generate', data),
    generateIdeas: (data: { category: string; count?: number }) =>
      api.post('/automation/generate-ideas', data),
    generateImage: (data: any) => api.post('/automation/generate-image', data),
    status: () => api.get('/automation/status'),
    stats: () => api.get('/automation/stats'),
  },

  // Blog endpoints
  blog: {
    posts: (params?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      sort?: string;
    }) => api.get('/blog/posts', { params }),
    post: (slug: string) => api.get(`/blog/posts/${slug}`),
    categories: () => api.get('/blog/categories'),
    tags: () => api.get('/blog/tags'),
    search: (params: { q: string; page?: number; limit?: number }) =>
      api.get('/blog/search', { params }),
  },
};
