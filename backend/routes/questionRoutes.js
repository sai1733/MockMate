import express from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  generateRubric
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// CRITICAL: Protect all question routes strictly with RBAC ('admin')
router.use(protect);
router.use(authorize('admin'));

// AI Rubric generation endpoint
router.post('/generate-rubric', generateRubric);

router.route('/')
  .get(getQuestions)
  .post(createQuestion);

router.route('/:id')
  .get(getQuestionById)
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;
