// src/services/auth.service.ts
import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

import { API_URL } from "../config";
console.log('API URL:', API_URL); // Debug log
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Response interceptor
authApi.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.error('Request Error:', {
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  try {

    const response = await authApi.post('/login', credentials);
    console.log('Auth Service: Server response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('name', response.data.user.name);
      localStorage.setItem('email', response.data.user.email);
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('canDownload', response.data.user.permissions.canDownload);
      localStorage.setItem('canSubmit', response.data.user.permissions.canSubmit);
      localStorage.setItem('canView', response.data.user.permissions.canView);
      localStorage.setItem('canUpload', response.data.user.permissions.canUpload);
    }
    
    return response.data;
  } catch (error) {
    console.error('Auth Service: Login error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Auth Service: Server response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
    throw error;
  }
};

export const register = async (credentials: RegisterCredentials): Promise<{ user: User; token: string }> => {
  const response = await authApi.post('/register', credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await authApi.get('/me');
  console.log(response);
  
  return response.data;
};

export const logout = async (): Promise<void> => {
  await authApi.post('/logout');
  localStorage.removeItem('token');
};