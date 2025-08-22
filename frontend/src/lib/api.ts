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
    console.log('🔍 [API] Making request to:', config.url);
    console.log('🔍 [API] Request method:', config.method);
    console.log('🔍 [API] Request headers:', config.headers);
    
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-storage');
      console.log('🔍 [API] Raw auth-storage:', token);
      
      if (token) {
        try {
          const authData = JSON.parse(token);
          console.log('🔍 [API] Parsed auth data:', authData);
          console.log('🔍 [API] Token from auth data:', authData.state?.token);
          
          if (authData.state?.token) {
            config.headers.Authorization = `Bearer ${authData.state.token}`;
            console.log('🔍 [API] Added Authorization header');
          } else {
            console.log('🔍 [API] No token found in auth data');
          }
        } catch (error) {
          console.error('🔍 [API] Error parsing auth data:', error);
        }
      } else {
        console.log('🔍 [API] No auth-storage found in localStorage');
      }
    }
    
    console.log('🔍 [API] Final request config:', config);
    return config;
  },
  (error) => {
    console.error('🔍 [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response received:', response.status, response.config.url);
    console.log('✅ [API] Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ [API] Response error:', error);
    console.error('❌ [API] Error status:', error.response?.status);
    console.error('❌ [API] Error data:', error.response?.data);
    console.error('❌ [API] Error config:', error.config);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔍 [API] 401 Unauthorized - redirecting to login');
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
    posts: {
      getAll: () => api.get('/admin/posts'),
      getById: (id: string) => api.get(`/admin/posts/${id}`),
      update: (id: string, data: any) => api.put(`/admin/posts/${id}`, data),
      publish: (id: string) => api.post(`/admin/posts/${id}/publish`),
      unpublish: (id: string) => api.post(`/admin/posts/${id}/unpublish`),
      delete: (id: string) => api.delete(`/admin/posts/${id}`),
    },
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

  // Content endpoints
  content: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      search?: string;
    }) => api.get('/content', { params }),
    getById: (id: string) => api.get(`/content/${id}`),
    create: (data: any) => api.post('/content', data),
    update: (id: string, data: any) => api.put(`/content/${id}`, data),
    delete: (id: string) => api.delete(`/content/${id}`),
    publish: (id: string) => api.post(`/content/${id}/publish`),
    unpublish: (id: string) => api.post(`/content/${id}/unpublish`),
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
