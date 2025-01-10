import { Parent } from '../interfaces/parent.interface';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const parentApi = axios.create({
  baseURL: `${API_URL}/parents`,
  headers: {
    'Content-Type': 'application/json',
  },
});

parentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const getParents = async (): Promise<Parent[]> => {
  const response = await parentApi.get('');
  return response.data.data;
};

export const getParent = async (id: string): Promise<Parent> => {
  const response = await parentApi.get(`/${id}`);
  return response.data.data;
};

export const createParent = async (parentData: Partial<Parent>): Promise<Parent> => {
  const response = await parentApi.post('', parentData);
  return response.data.data;
};

export const updateParent = async (id: string, parentData: Partial<Parent>): Promise<Parent> => {
  const response = await parentApi.put(`/${id}`, parentData);
  return response.data.data;
};

export const deleteParent = async (id: string): Promise<void> => {
  await parentApi.delete(`/${id}`);
};