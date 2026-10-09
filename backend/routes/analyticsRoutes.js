import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserStats, getInterviewHistory } from '../controllers/analyticsController.js';

const router = express.Router();

// Mount endpoints under /api/analytics
router.get('/user-stats', protect, getUserStats);
router.get('/users/me/stats', protect, getUserStats);
router.get('/stats', protect, getUserStats);
router.get('/history', protect, getInterviewHistory);
router.get('/interviews/history', protect, getInterviewHistory);

export default router;
