// server/src/controllers/teacher.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Teacher } from '../models/teacher.model.mjs';
import { User } from '../models/user.model.mjs';

export const createTeacher = async (req: Request, res: Response) => {

  try {
    const { name, email, password, department, permissions } = req.body;
console.log(req.body);

    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {

      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Teacher
    const teacher = await Teacher.create(
      
        {
          name,
          email,
          password: hashedPassword,
          department,
          permissions: {
            ...permissions,
            canUpload: permissions?.canUpload,
            canDownload: permissions?.canDownload
          }
        }
     
    );
    await teacher.save();

    // Create User linked to Teacher
    await User.create(
      
        {
          email,
          password,
          name,
          role: 'teacher'
        }
     
    );


 
    const { password: _, ...teacherWithoutPassword } = teacher.toObject();
  
    return res.status(201).json({
      status: "success",
      data: teacherWithoutPassword,
    });


  } catch (error) {

    console.error('Error creating teacher:', error);
    res.status(500).json({ status: 'error', message: 'Error creating teacher' });
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

// Update teacher (with User update)
export const updateTeacher = async (req: Request, res: Response) => {

  try {
    const { id } = req.params;
    const updateData = req.body;

    // If permissions change, ensure related fields are updated
    if (updateData.permissions?.canUpload) {
      updateData.permissions.canEdit = true;
      updateData.permissions.canDelete = true;
    }

    // Find the teacher
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ status: 'error', message: 'Teacher not found' });
    }

    // Update Teacher
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    // Update User account
    await User.findOneAndUpdate(
      { email: teacher.email },
      { $set: { name: updateData.name || teacher.name, email: updateData.email || teacher.email } },
      { new: true }
    );

    res.status(200).json({ status: 'success', data: updatedTeacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ status: 'error', message: 'Error updating teacher' });
  }
};

// Delete teacher (with User deletion)
export const deleteTeacher = async (req: Request, res: Response) => {

  try {
    const { id } = req.params;

    // Find teacher
    const teacher = await Teacher.findById(id);
    if (!teacher) {

      return res.status(404).json({ status: 'error', message: 'Teacher not found' });
    }

    // Delete Teacher
    await Teacher.findByIdAndDelete(id);

    // Delete corresponding User
    await User.findOneAndDelete({ email: teacher.email });

    res.status(200).json({ status: 'success', message: 'Teacher and associated user deleted successfully' });
  } catch (error) {

    console.error('Error deleting teacher:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting teacher' });
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

