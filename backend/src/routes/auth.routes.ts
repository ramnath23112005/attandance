import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';
import { UserRole } from '../types';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize(UserRole.ADMIN), authController.getAllUsers);

export default router;
