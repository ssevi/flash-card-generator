// src/services/teacher.service.ts
import axios from 'axios';

import { API_URL } from "../config";

const teacherApi = axios.create({
  baseURL: `${API_URL}/teachers`,
  headers: {
    'Content-Type': 'application/json',
  },
});

teacherApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  department: string;
  permissions: {
    canUpload: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface TeacherPermissions {
  canUpload: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface TeacherEdit {
  permissions: TeacherPermissions;
  _id: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  password: string;
  department: string;
  permissions: {
    canUpload: boolean;
    canDownload: boolean;
  };
}

export const createTeacher = async (data: CreateTeacherData): Promise<Teacher> => {
  const response = await teacherApi.post('/', data);
  return response.data.data;
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await teacherApi.get('/');
  return response.data.data;
};

export const getTeacher = async (id: string): Promise<TeacherEdit> => {
  const response = await teacherApi.get(`/${id}`);
  console.log(response.data.data);
  return response.data.data;
};

export const updateTeacher = async (id: string, data: Partial<CreateTeacherData>): Promise<Teacher> => {
  const response = await teacherApi.put(`/${id}`, data);
  return response.data.data;
};

export const deleteTeacher = async (id: string): Promise<Teacher> => {
  const response = await teacherApi.delete(`/${id}`);
  return response.data.data;
};