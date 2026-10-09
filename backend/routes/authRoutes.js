import express from 'express';
import {
  register,
  login,
  refresh,
  logout
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply auth rate limiter (5 requests per 15 minutes per IP)
router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
