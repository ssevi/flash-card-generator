// src/routes/auth.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { login, createSampleUser } from '../controllers/auth.controller';

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
//router.post('/logout', authMiddleware, authController.logout);
//router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/create-sample-user', createSampleUser);
export default router;