// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError } from './error.middleware';
import { User } from '../models/user.model';

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from request
    let token: string | undefined;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.sub).select('-password');
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token no longer exists.',
          401
        )
      );
    }

    // 4. Check if user changed password after the token was issued
    if (currentUser.passwordChangedAt && decoded.iat) {
      const changedTimestamp = currentUser.passwordChangedAt.getTime() / 1000;
      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }
    }

    // Grant access to protected route
    req.user = currentUser;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    next(error);
  }
};