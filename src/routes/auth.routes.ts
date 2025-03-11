// src/routes/auth.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { login, createSampleUser, logout , getCurrentUser} from '../controllers/auth.controller.mjs';

const router = Router();

// // TODO: Import these from auth controller once created
// const authController = {
//   register: (req: any, res: any) => res.status(501).json({ message: 'Not implemented' }),
//   login: (req: any, res: any) => res.status(501).json({ message: 'Not implemented' }),
//   logout: (req: any, res: any) => res.status(501).json({ message: 'Not implemented' }),
//   getCurrentUser: (req: any, res: any) => res.status(501).json({ message: 'Not implemented' }),
// };

//router.post('/register', authController.register);
router.post('/login', login);
router.post('/create-sample-user', createSampleUser);

router.use(authMiddleware); // Apply auth middleware to all routes below
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);
export default router;