import axios from 'axios';
import useAuthStore from '../store/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const doctorAPI = {
  createProfile: (formData) => api.post('/doctors/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  updateProfile: (data) => api.put('/doctors/profile', data),
};

export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getOne: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
};

export const paymentAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
};

export const prescriptionAPI = {
  create: (data) => api.post('/prescriptions', data),
  getAll: () => api.get('/prescriptions'),
};

export const chatAPI = {
  getMessages: (appointmentId) => api.get(`/chat/messages/${appointmentId}`),
};

export const fileAPI = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/files'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const adminAPI = {
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  approveDoctor: (id, data) => api.put(`/admin/doctors/${id}/approve`, data),
  getStats: () => api.get('/admin/stats'),
};

export default api;