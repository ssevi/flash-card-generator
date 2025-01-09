// src/services/collection.service.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

export const createCollection = async (collectionData: CreateCollectionData): Promise<Collection> => {
  try {
    const response = await collectionApi.post('/', collectionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

export const getCollectionPhotos = async (collectionId: string): Promise<Photo[]> => {
  try {
    const response = await collectionApi.get(`/${collectionId}/photos`);
    console.log('Raw response data:', response.data);

    // Map and modify URLs
    const photos = response.data.data.map((photo: Photo) => {
      console.log('Photo URL:', photo.url);      
      return {
        ...photo,
        url: `${process.env.REACT_APP_API_URL_2}${photo.url}`
        
        
      };
    });

    return photos;
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