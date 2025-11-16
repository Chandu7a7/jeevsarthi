import axios from 'axios';

// Use proxy in development - Vite proxy handles both localhost and network IP
const getApiUrl = () => {
  // In development, always use proxy - Vite will handle routing to backend
  // This works for both localhost and network IP access
  if (import.meta.env.DEV) {
    // Force use of proxy in development, ignore VITE_API_URL to avoid connection issues
    return '/api';
  }
  
  // In production, use VITE_API_URL if set, otherwise fallback to localhost
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error - server is not reachable
      const networkError = new Error(
        error.code === 'ECONNABORTED'
          ? 'Request timeout. Please check your internet connection.'
          : 'Network error. Please ensure the server is running and accessible.'
      );
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    // Handle HTTP errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
};

// Farmer APIs
export const farmerAPI = {
  registerAnimal: (data) => api.post('/farmer/animals', data),
  getAnimals: () => api.get('/farmer/animals'),
  getDashboard: () => api.get('/farmer/dashboard'),
  getAlerts: (filters) => api.get('/farmer/alerts', { params: filters }),
  markAlertAsRead: (id) => api.put(`/farmer/alerts/${id}/read`),
  getProfile: () => api.get('/farmer/profile'),
  updateProfile: (data) => api.put('/farmer/profile', data),
  getMRLOverview: () => api.get('/farmer/mrl-overview'),
};

// Treatment APIs
export const treatmentAPI = {
  addTreatment: (data) => api.post('/treatments', data),
  getTreatments: (filters) => api.get('/treatments', { params: filters }),
  searchDrugs: (query) => api.get('/treatments/drugs/search', { params: { q: query } }),
  getDrugByName: (drugName) => api.get(`/treatments/drugs/${drugName}`),
};

// Lab APIs
export const labAPI = {
  uploadTestResult: (data) => api.post('/lab/tests', data),
  getLabTests: (filters) => api.get('/lab/tests', { params: filters }),
  getDashboard: () => api.get('/lab/dashboard'),
};

// Regulator APIs
export const regulatorAPI = {
  getDashboard: () => api.get('/regulator/dashboard'),
  getRegionStats: () => api.get('/regulator/regions'),
};

// Blockchain verification
export const verifyHash = (hash) => api.get(`/verify/${hash}`);

// Public animal API (for QR scanning)
export const animalAPI = {
  getAnimalByPashuAadhaarId: (pashuAadhaarId) => api.get(`/animals/${pashuAadhaarId}`),
  scanByTag: (tagId, token) => api.get('/animal/scan', { params: { tagId, token } }),
  logScanEvent: (data) => api.post('/animal/scan/log', data),
};

// Vet APIs
export const vetAPI = {
  createOrUpdateProfile: (data) => {
    if (data instanceof FormData) {
      return api.post('/vet/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/vet/profile', data);
  },
  getProfile: () => api.get('/vet/profile'),
  searchNearbyVets: (lat, lng, distance = 25000, filters = {}) =>
    api.get('/vet/nearby', {
      params: { lat, lng, distance, ...filters },
    }),
  getPublicProfile: (vetId) => api.get(`/vet/${vetId}/public`),
};

// Consultation APIs
export const consultationAPI = {
  findNearbyVets: (lat, lng, radius = 25000) =>
    api.get(`/consultation/vets/nearby`, { params: { lat, lng, radius } }),
  createConsultation: (data) => api.post('/consultation/create', data),
  acceptConsultation: (id) => api.patch(`/consultation/accept/${id}`),
  getConsultation: (id) => api.get(`/consultation/${id}`),
  getFarmerConsultations: () => api.get('/consultation/farmer/list'),
  getVetConsultations: () => api.get('/consultation/vet/list'),
  updateConsultationStatus: (id, status) =>
    api.patch(`/consultation/${id}/status`, { status }),
};

export default api;

