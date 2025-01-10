// server/src/controllers/teacher.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Teacher } from '../models/teacher.model';

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, permissions } = req.body;

    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create teacher
    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      department,
      permissions: {
        ...permissions,
        canEdit: permissions.canUpload,
        canDelete: permissions.canUpload
      }
    });

    // Remove password from response
    const teacherResponse: Partial<typeof teacher> = teacher.toObject();
    delete teacherResponse.password;

    res.status(201).json({
      status: 'success',
      data: teacherResponse
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating teacher'
    });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find().select('-password');
    res.status(200).json({
      status: 'success',
      data: teachers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching teachers'
    });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.permissions?.canUpload) {
      updateData.permissions.canEdit = true;
      updateData.permissions.canDelete = true;
    }

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: teacher
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating teacher'
    });
  }
};

export const getATeacher = async (req: Request, res: Response) => {
    console.log("reached here");
    
    try {
      const teacher = await Teacher.findById(req.params.id).select('-password');
      if (!teacher) {
        return res.status(404).json({
          status: 'error',
          message: 'Teacher not found'
        });
      }
      res.status(200).json({
        status: 'success',
        data: teacher
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error fetching teacher'
      });
    }
  };

export const deleteTeacher = async (req: Request, res: Response) => {
    try {
      const teacher = await Teacher.findByIdAndDelete(req.params.id);
      
      if (!teacher) {
        return res.status(404).json({
          status: 'error',
          message: 'Teacher not found'
        });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error deleting teacher'
      });
    }
  };  