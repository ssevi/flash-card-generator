// server/src/index.ts
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import collectionRoutes from './routes/collection.routes';
import teacherRoutes from './routes/teacher.routes';

import  parentRoutes  from './routes/parent.routes';

import { errorHandler, notFound } from './middleware/errorHandler';
import { ConnectOptions } from 'mongoose';
// Load environment variables
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5001;
app.use(cors({
  origin: '*', // Temporarily allow all origins for testing
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// In your server's index.ts or app.ts
app.use('/uploads', express.static('uploads'));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Handle 404s
app.use(notFound);

// Global error handler
app.use(errorHandler);
// Connect to MongoDB
interface IConnectOptions extends ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

const connectOptions: IConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard_db', connectOptions)
  .then((): void => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', (): void => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: Error): void => {
    console.error('MongoDB connection error:', error);
  });