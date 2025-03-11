// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config  from '../config/config.mjs';
import { AppError } from './error.middleware.mjs';
import { User } from '../models/user.model.mjs';

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth Middleware - Headers:', req.headers);
    
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token found:', token ? 'exists' : 'not found');

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      console.log('Token decoded:_____________________', decoded.sub);

      // Get user
      const user = await User.findById(decoded.sub).select('-password');
      console.log('Looking for user with ID:', decoded.sub);
      if (!user) {
        console.log('No user found for token');
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Add user to request
      req.user = user;
      console.log('User attached to request:', user._id);
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};