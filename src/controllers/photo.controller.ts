// server/src/controllers/photo.controller.ts
import { Request, Response } from 'express';
import { Collection } from '../models/collection.model.js';
import { Photo, type IPhoto } from '../models/photo.model.js';
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
      const { id } = req.params;
      
      const collection = await Collection.findById(id);
      if (!collection) {
        return res.status(404).json({
          status: 'error',
          message: 'Collection not found'
        });
      }
      
      // Use the TypeScript interface from your import
      let photos: IPhoto[] = await Photo.find({ collectionId: id });
      
      // Sort photos according to the saved order if it exists
      if (Array.isArray(collection.photoOrder) && collection.photoOrder.length > 0) {
        // Convert to Map for efficient lookup
        const photosMap = new Map(photos.map(photo => [photo._id.toString(), photo]));
        
        // Order the photos according to photoOrder, including any photos not in the order at the end
        const orderedPhotos: IPhoto[] = [];
        
        // First add photos in the specified order
        collection.photoOrder.forEach(photoId => {
          const photo = photosMap.get(photoId.toString());
          if (photo) {
            orderedPhotos.push(photo);
            photosMap.delete(photoId.toString());
          }
        });
        
        // Then add any remaining photos
        orderedPhotos.push(...Array.from(photosMap.values()));
        
        photos = orderedPhotos;
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          collection: {
            title: collection.title,
            description: collection.description
          },
          photos: {
            items: photos
          }
        }
      });
    } catch (error) {
      console.error('Error fetching collection photos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch collection photos'
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
