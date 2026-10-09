import express from 'express';
import {
  startInterview,
  nextQuestion,
  submitAnswer,
  getInterviewById
} from '../controllers/interviewController.js';
import { getInterviewHistory } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiEngineLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All interview endpoints strictly protected by Bearer Access Token
router.use(protect);

router.post('/start', startInterview);
router.get('/history', getInterviewHistory);
router.post('/:id/next-question', nextQuestion);
router.post('/:id/answer', aiEngineLimiter, submitAnswer);
router.get('/:id', getInterviewById);

export default router;
