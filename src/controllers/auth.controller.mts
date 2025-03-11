import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.mjs';
import { Teacher } from '../models/teacher.model.mjs';
import { Parent } from '../models/parent.model.mjs';
import config from '../config/config.mjs';
import { AppError } from '../middleware/error.middleware.mjs';

const jwtSecret = config.jwtSecret as string;

const generateToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: "1h" });
};

const getPermissions = async (user: any) => {
  switch (user.role) {
    case 'teacher':
      const teacherDetails = await Teacher.findOne({ email: user.email });
      if (teacherDetails) {
        return {
          canUpload: teacherDetails.permissions.canUpload,
          canDownload: teacherDetails.permissions.canDownload,
          canEdit: teacherDetails.permissions.canEdit,
          canDelete: teacherDetails.permissions.canDelete
        };
      }
      return {
        canUpload: false,
        canDownload: true,
        canEdit: false,
        canDelete: false
      };

    case 'parent':
      const parentDetails = await Parent.findOne({ email: user.email });
      if (parentDetails) {
        return {
          canView: parentDetails.permissions.canView,
          canDownload: parentDetails.permissions.canDownload
        };
      }
      return {
        canView: true,
        canDownload: true
      };

    case 'admin':
      return {
        canUpload: true,
        canDownload: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true
      };

    case 'student':
      return {
        canView: true,
        canDownload: true,
        canSubmit: true
      };

    default:
      return {
        canView: true,
        canDownload: false
      };
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user & include password field
    const user = await User.findOne({ email }).select('+password');

    // Verify user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Generate JWT token
    const token = generateToken(user._id as string);

    // Get role-based permissions
    const permissions = await getPermissions(user);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      user: {
        ...user.toObject(),
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createSampleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'teacher'
    });

    const permissions = await getPermissions(user);

    res.status(201).json({
      status: 'success',
      message: 'Sample user created',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const permissions = await getPermissions(user);

    res.status(200).json({
      status: 'success',
      data: {
        ...user.toObject(),
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
};