// src/services/authService.ts
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Simulated API delay
const MOCK_DELAY = 1000;

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: '1',
    email: 'teacher@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'teacher' as const,
  },
  {
    id: '2',
    email: 'student@example.com',
    password: 'password123',
    name: 'Jane Smith',
    role: 'student' as const,
  },
];

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    const user = MOCK_USERS.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    // Store auth token in localStorage
    localStorage.setItem('authToken', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

// Custom hook for authentication state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUser(user);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
  };
};