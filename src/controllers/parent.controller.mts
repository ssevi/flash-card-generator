import { Request, Response } from 'express';
import { Parent } from '../models/parent.model.mjs';
import { ApiError } from '../utils/ApiError.mjs';
import { User } from '../models/user.model.mjs';
import mongoose from "mongoose";

import bcrypt from 'bcryptjs';

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


  export const createParent = async (req: Request, res: Response) => {
    try {
      const { name, email, password, department, permissions, childAge, childName } = req.body;
  
      // Check if the email is already in use
      const existingParent = await Parent.findOne({ email });
      if (existingParent) {
        return res.status(400).json({ error: "Email already in use" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create Parent
      const parent = new Parent({
        name,
        email,
        department,
        permissions,
        childAge,
        childName,
        password: hashedPassword,
      });
  
      await parent.save();
  
      // Create User
      const user = new User({
        email,
        password,
        name,
        role: "student",
      });
  
      await user.save();
  
      // Remove password before sending response
      const { password: _, ...parentWithoutPassword } = parent.toObject();
  
      return res.status(201).json({
        status: "success",
        data: parentWithoutPassword,
      });
    } catch (error) {
      console.error("Error creating parent:", error);
      return res.status(500).json({ error: "Error creating parent" });
    }
  };
  
  
  export const updateParent = async (req: Request, res: Response) => {
    try {
      const { email, name, department, permissions, childAge, childName } = req.body;
      const parentId = req.params.id;
  
      // Check if email is already in use by another parent
      if (email) {
        const existingParent = await Parent.findOne({ email, _id: { $ne: parentId } });
        if (existingParent) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }
  
      // Update Parent
      const parent = await Parent.findByIdAndUpdate(
        parentId,
        { $set: { name, email, department, permissions, childAge, childName } },
        { new: true, runValidators: true }
      ).select("-password");
  
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
  
      // Update corresponding User
      await User.findOneAndUpdate(
        { email: parent.email },
        { $set: { name, email } },
        { new: true }
      );
  
      res.status(200).json({
        status: "success",
        data: parent,
      });
    } catch (error) {
      console.error("Error updating parent:", error);
      res.status(500).json({ error: "Error updating parent" });
    }
  };
  
export const deleteParent = async (req: Request, res: Response) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ status: 'error', message: 'Parent not found' });
    }

    // Delete associated user first
    await User.findOneAndDelete({ email: parent.email });

    // Now delete parent
    await Parent.findByIdAndDelete(req.params.id);

    res.status(200).json({ status: 'success', message: 'Parent deleted successfully' });
  } catch (error) {
    console.error('Error deleting parent:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting parent' });
  }
};
