import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // For blob responses (PDF, CSV, etc.), return the full response to preserve the blob
    if (response.config.responseType === 'blob') {
      return response;
    }
    // For JSON responses, return the data
    return response.data;
  },
  (error) => {
    // Don't auto-redirect on 401 - let components handle auth errors
    // The ProtectedRoute already handles authentication state
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  uploadProfilePicture: (formData) => api.post('/auth/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Loan Types API
export const loanTypesAPI = {
  getAll: () => api.get('/loan-types'),
  getById: (id) => api.get(`/loan-types/${id}`),
  checkEligibility: (data) => api.post('/loan-types/check-eligibility', data),
  calculateEMI: (data) => api.post('/loan-types/calculate-emi', data)
};

// Applications API
export const applicationsAPI = {
  create: (data) => api.post('/applications', data),
  getUserApplications: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  getAllApplications: (params) => api.get('/applications/admin/all', { params }),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  delete: (id) => api.delete(`/applications/${id}`)
};

// Documents API
export const documentsAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByApplication: (applicationId) => api.get(`/documents/application/${applicationId}`),
  verify: (id, data) => api.put(`/documents/${id}/verify`, data),
  delete: (id) => api.delete(`/documents/${id}`)
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getUserDashboard: () => api.get('/dashboard/user'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params })
};

// Helper to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper to format date
export const formatDate = (date) => {
  // Handle null, undefined, empty string, or invalid dates
  if (!date) {
    return 'N/A';
  }
  
  try {
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('[formatDate] Invalid date value:', date);
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error('[formatDate] Error formatting date:', { date, error });
    return 'N/A';
  }
};

// Calculate EMI
export const calculateEMI = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
               (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
};

export default api;
