// src/services/api.js
import axios from 'axios';

// Adjust the baseURL to where your Django backend is running
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle token refresh on 401 errors
// This is more advanced and involves storing/using the refresh token
// apiClient.interceptors.response.use( ... );

export default apiClient;