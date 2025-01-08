// src/services/authApi.ts
import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, User } from '../../types/auth.types';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
authApi.interceptors.request.use(
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

// Response interceptor for API calls
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  const response = await authApi.post('/login', credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<{ user: User; token: string }> => {
  const response = await authApi.post('/register', credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await authApi.get('/me');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await authApi.post('/logout');
  localStorage.removeItem('token');
};