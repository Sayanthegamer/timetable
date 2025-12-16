import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', authenticate, logout);

export default router;
