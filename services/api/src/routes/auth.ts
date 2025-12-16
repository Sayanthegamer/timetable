import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, logout } from '../controllers/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth';
import { authenticate, AuthRequest } from '../middleware/auth';

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshLimiter, validate(refreshTokenSchema), refreshToken);
router.post('/logout', authenticate, logout);

export default router;
