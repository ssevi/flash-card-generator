// src/services/collection.service.ts
import axios from 'axios';

import { BASE_URL, API_URL } from "../config";

const collectionApi = axios.create({
  baseURL: `${API_URL}/collections`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
collectionApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
collectionApi.interceptors.response.use(
  (response) => {
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);

// Interfaces
export interface Collection {
  _id: string;
  title: string;
  description: string;
  category: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionData {
  title: string;
  description: string;
  category: string;
}

export interface Photo {
  _id: string;
  url: string;
  title: string;
  description?: string;
}
interface CollectionWithPhotos {
  collection: {
    title: string;
    description: string;
  };
  photos: Photo[];
}
// API Functions
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const response = await collectionApi.get('/');
    console.log('Collections response:', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

export const getAllCollections = async (): Promise<Collection[]> => {
  try {
    const response = await collectionApi.get('/all');
    console.log('Collections response:', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

export const createCollection = async (collectionData: CreateCollectionData): Promise<Collection> => {
  try {
    const response = await collectionApi.post('/', collectionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

export const getCollectionPhotos = async (collectionId: string): Promise<CollectionWithPhotos> => {
  try {
    const response = await collectionApi.get(`/${collectionId}/photos`);
    console.log('Raw response data:', response.data);

    // Map and modify URLs
    const photos = response.data.data.photos.items.map((photo: Photo) => ({
      ...photo,
      url: `${BASE_URL}${photo.url}`
    }));

    // Return both collection data and photos
    return {
      collection: {
        title: response.data.data.collection.title,
        description: response.data.data.collection.description
      },
      photos: photos
    };

  } catch (error) {
    console.error('Detailed error fetching collection photos:', error);
    throw error;
  }
};

// src/services/collection.service.ts

export const addPhotoToCollection = async (
  collectionId: string,
  data: { title: string; description: string; photo: File }
) => {
  try {
    const formData = new FormData();
    formData.append('photo', data.photo);
    formData.append('title', data.title);
    formData.append('description', data.description);

    console.log('Uploading photo to collection:', collectionId);
    console.log('Form data:', {
      title: data.title,
      description: data.description,
      photoName: data.photo.name
    });

    const response = await collectionApi.post(`/${collectionId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error uploading photo:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to upload photo');
  }
};

export const updatePhotoOrder = async (
  collectionId: string,
  photoIds: string[]
): Promise<void> => {
  try {
    const response = await collectionApi.put(`/${collectionId}/photos/reorder`, {
      photoIds: photoIds
    });
    console.log('Update photo order response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating photo order:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to update photo order'
    );
  }
};
// Add to existing file, after addPhotoToCollection method
export const deletePhotoFromCollection = async (
  collectionId: string, 
  photoId: string
): Promise<void> => {
  try {
    const response = await collectionApi.delete(`/${collectionId}/photos/${photoId}`);
    console.log('Delete photo response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting photo:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete photo from collection'
    );
  }
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
  try {
  
    const response = await collectionApi.delete(`/${collectionId}`);
    return response.data;

  } catch (error) {
    throw new Error('Failed to delete collection');
  }
};