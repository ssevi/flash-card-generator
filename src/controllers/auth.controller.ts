// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { config } from '../config/config';
import { AppError } from '../middleware/error.middleware';

const generateToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
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

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// For testing: Create a sample user
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

    res.status(201).json({
      status: 'success',
      message: 'Sample user created',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};