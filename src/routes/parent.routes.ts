// server/src/routes/parent.routes.ts
import express from 'express';
import { createParent, getAllParents, updateParent, getAParent, deleteParent } from '../controllers/parent.controller.mjs';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new teacher
router.post('/', authMiddleware, createParent);

// Get all teachers
router.get('/', authMiddleware, getAllParents);

// Update a teacher
router.patch('/:id', authMiddleware, updateParent);

// Get a single teacher
router.get('/:id', authMiddleware, getAParent);

// Update a teacher
router.put('/:id', authMiddleware, updateParent);

// Delete a teacher
router.delete('/:id', authMiddleware, deleteParent);


export default router;