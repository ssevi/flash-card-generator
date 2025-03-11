// server/src/routes/teacher.routes.ts
import express from 'express';
import { createTeacher, getAllTeachers, updateTeacher, getATeacher, deleteTeacher } from '../controllers/teacher.controller.mjs';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new teacher
router.post('/', authMiddleware, createTeacher);

// Get all teachers
router.get('/', authMiddleware, getAllTeachers);

// Update a teacher
router.patch('/:id', authMiddleware, updateTeacher);

// Get a single teacher
router.get('/:id', authMiddleware, getATeacher);

// Update a teacher
router.put('/:id', authMiddleware, updateTeacher);

// Delete a teacher
router.delete('/:id', authMiddleware, deleteTeacher);


export default router;