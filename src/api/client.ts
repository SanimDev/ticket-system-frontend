import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token || localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: error handling & 401 redirect
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || errorData?.error || error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Clear token & redirect to login
      useAuthStore.getState().logout();
      message.error('Session expired or unauthorized. Please log in again.');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('Access denied. You do not have permission for this action.');
    } else if (status === 404) {
      message.warning('Requested resource not found.');
    } else if (status && status >= 500) {
      message.error(`Server Error (${status}): ${errorMessage}`);
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      // Backend not running on port 8080
      console.warn('Backend server is unreachable at', BASE_URL);
    } else {
      message.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

