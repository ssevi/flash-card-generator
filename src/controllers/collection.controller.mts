// server/src/controllers/collection.controller.ts
import { Request, Response } from 'express';
import { Collection } from '../models/collection.model.mjs';
import { Photo } from '../models/photo.model.mjs';

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
  