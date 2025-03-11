// server/src/controllers/photo.controller.ts
import { Request, Response } from 'express';
import { Collection } from '../models/collection.model.js';
import { Photo } from '../models/photo.model.js';
export const addPhoto = async (req: Request, res: Response) => {
    try {
      const collectionId = req.params.id;
      const { title, description } = req.body;
      const photoFile = req.file;
  
      if (!photoFile) {
        return res.status(400).json({
          status: 'error',
          message: 'No photo uploaded'
        });
      }
  
      const photo = await Photo.create({
        collectionId,
        title,
        description,
        url: `/uploads/${photoFile.filename}`,
      });
  
      res.status(201).json({
        status: 'success',
        data: photo
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error adding photo'
      });
    }
  };
  export const getPhotos = async (req: Request, res: Response) => {
    try {
      const collectionId = req.params.id;
  
      // Validate that the collection exists
      const collection = await Collection.findById(collectionId);
      if (!collection) {
        return res.status(404).json({
          status: 'error',
          message: 'Collection not found'
        });
      }
  console.log('collection:____________________', collection);
  
      // Find all photos for this collection
      const photos = await Photo.find({ collectionId });
  //console.log('photos:', photos);
  
      res.status(200).json({
        status: 'success',
        count: photos.length,
        data: {
          collection: {
            title: collection.title,
            description: collection.description
          },
          photos: {
            count: photos.length,
            items: photos
          }
        }
      });
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error fetching photos'
      });
    }
  };
  
  export const deletePhoto = async (req: Request, res: Response) => {
    try {
      const photoId = req.params.photoId;
      const collectionId = req.params.id;
  
      // Validate that the photo exists and belongs to the collection
      const photo = await Photo.findOneAndDelete({ 
        _id: photoId, 
        collectionId: collectionId 
      });
  
      if (!photo) {
        return res.status(404).json({
          status: 'error',
          message: 'Photo not found in this collection'
        });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error deleting photo'
      });
    }
  };
