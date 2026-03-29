import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

import toast from 'react-hot-toast';

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Error Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection or server status.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

export default api;
