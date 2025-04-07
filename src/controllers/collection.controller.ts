// server/src/controllers/collection.controller.ts
import { Request, Response } from 'express';
import { Collection } from '../models/collection.model.js';
import { Photo } from '../models/photo.model.js';

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id; // From auth middleware

    const collection = await Collection.create({
      title,
      description,
      category,
      userId
    });

    res.status(201).json({
      status: 'success',
      data: collection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create collection'
    });
  }
};

export const getCollections = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id; // From auth middleware
      const collections = await Collection.find({ userId })
        .select('title description category cardCount createdAt updatedAt')
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        status: 'success',
        data: collections
      });
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch collections'
      });
    }
  };

  export const getAllCollections = async (req: Request, res: Response) => {
    try {
      const collections = await Collection.find()
        .select('title description category cardCount createdAt updatedAt')
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        status: 'success',
        data: collections
      });
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch collections'
      });
    }
  };
  export const updatePhotoOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;  // Collection ID
      const { photoIds } = req.body;  // Array of photo IDs in their new order
      
      if (!Array.isArray(photoIds) || photoIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid photo order data'
        });
      }
  
      // Validate collection exists
      const collection = await Collection.findById(id);
      if (!collection) {
        return res.status(404).json({
          status: 'error',
          message: 'Collection not found'
        });
      }
  
      // Validate user has permission to modify this collection
      if (collection.userId.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to modify this collection'
        });
      }
  
      // Verify all photos exist and belong to this collection
      const photos = await Photo.find({
        _id: { $in: photoIds },
        collectionId: id
      });
  
      if (photos.length !== photoIds.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more photos do not exist or do not belong to this collection'
        });
      }
  
      // Since you don't have an explicit 'order' field, we'll create a new array 
      // with the correct order and save it to a custom field in the collection
      await Collection.findByIdAndUpdate(id, {
        photoOrder: photoIds
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Photo order updated successfully'
      });
    } catch (error) {
      console.error('Error updating photo order:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update photo order'
      });
    }
  };

  export const deleteCollection = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validate collection exists
      const collection = await Collection.findById(id);
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
  
      // Optional: Delete associated photos/cards first
      await Photo.deleteMany({ collectionId: id });
      
      // Delete the collection
      await Collection.findByIdAndDelete(id);
      
      res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ message: 'Failed to delete collection' });
    }
  };
  