// src/config/config.ts
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5001,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard_db',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export default config;