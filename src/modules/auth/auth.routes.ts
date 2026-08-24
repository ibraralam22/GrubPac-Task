import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Apply authRateLimiter (10 req/min/IP) to all auth endpoints
router.use(authRateLimiter);

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);
router.post('/logout', validateRequest(logoutSchema), authController.logout);

// Protected session helpers
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.me);

export const authRouter = router;
