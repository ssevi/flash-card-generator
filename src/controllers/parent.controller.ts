import { Request, Response } from 'express';
import { Parent } from '../models/parent.model';
import { ApiError } from '../utils/ApiError';


  // Get all parents
 export const getAllParents = async (req: Request, res: Response)=> {
    try {
      const parents = await Parent.find().select('-password');
      res.status(200).json({
        status: 'success',
        data: parents
      });
    } catch (error) {
      throw new ApiError(500, 'Error fetching parents');
    }
  };

  // Get single parent
  export const getAParent = async (req: Request, res: Response) => {
    try {
      const parent = await Parent.findById(req.params.id).select('-password');
      if (!parent) {
        throw new ApiError(404, 'Parent not found');
      }
      
      res.status(200).json({
        status: 'success',
        data: parent
      });
    } catch (error) {
      throw new ApiError(500, 'Error fetching parent');
    }
  };

  // Create parent
  export const createParent = async (req: Request, res: Response)=> {

    try {
      const existingParent = await Parent.findOne({ email: req.body.email });
      if (existingParent) {
        throw new ApiError(400, 'Email already in use');
      }

      const parent = await Parent.create(req.body);
      const { password, ...parentWithoutPassword } = parent.toObject(); // Remove password from response
      
      res.status(201).json({
        status: 'success',
        data: parent
      });
    } catch (error) {
      throw new ApiError(500, 'Error creating parent');
    }
  };

  // Update parent
  export const updateParent = async (req: Request, res: Response)=> {

    try {
      if (req.body.email) {
        const existingParent = await Parent.findOne({ 
          email: req.body.email,
          _id: { $ne: req.params.id }
        });
        
        if (existingParent) {
          throw new ApiError(400, 'Email already in use');
        }
      }

      const parent = await Parent.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password');

      if (!parent) {
        throw new ApiError(404, 'Parent not found');
      }

      res.status(200).json({
        status: 'success',
        data: parent
      });
    } catch (error) {
      throw new ApiError(500, 'Error updating parent');
    }
  };

  // Delete parent
  export const deleteParent = async (req: Request, res: Response)=> {
    try {
      const parent = await Parent.findByIdAndDelete(req.params.id);
      if (!parent) {
        throw new ApiError(404, 'Parent not found');
      }

      res.status(200).json({
        status: 'success',
        message: 'Parent deleted successfully'
      });
    } catch (error) {
      throw new ApiError(500, 'Error deleting parent');
    }
  };
