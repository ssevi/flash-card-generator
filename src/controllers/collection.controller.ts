// server/src/controllers/collection.controller.ts
import { Request, Response } from 'express';
import { Collection } from '../models/collection.model';

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