// src/services/auth.service.ts
import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log('API URL:', API_URL); // Debug log
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
// Debug interceptor
authApi.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data
  });
  return request;
});

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
    console.log('Auth Service: Attempting login to:', `${API_URL}/auth/login`);
    console.log('Auth Service: With credentials:', credentials);
    
    const response = await authApi.post('/login', credentials);
    console.log('Auth Service: Server response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
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
  return response.data;
};

export const logout = async (): Promise<void> => {
  await authApi.post('/logout');
  localStorage.removeItem('token');
};