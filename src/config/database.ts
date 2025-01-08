// src/config/database.ts
import mongoose from 'mongoose';
import { config } from './config';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', config.mongodbUri.replace(/:[^:]*@/, ':****@')); // Hide password in logs
    
    const conn = await mongoose.connect(config.mongodbUri);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database:', conn.connection.name);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};