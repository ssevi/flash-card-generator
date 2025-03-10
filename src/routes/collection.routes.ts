// server/src/routes/collection.routes.ts
import express from 'express';
import { createCollection,  getCollections, deleteCollection, getAllCollections } from '../controllers/collection.controller';
import { addPhoto } from '../controllers/photo.controller';

import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.middleware';
import * as photoController from '../controllers/photo.controller';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/:id/photos', authMiddleware, upload.single('photo'), photoController.addPhoto);
router.get('/:id/photos', authMiddleware, photoController.getPhotos);
router.delete('/:id/photos/:photoId', authMiddleware, photoController.deletePhoto);

router.delete('/:id',authMiddleware, deleteCollection);



router.post('/', authMiddleware, createCollection);
router.get('/', authMiddleware, getCollections);
router.get('/all', authMiddleware, getAllCollections);


export default router;