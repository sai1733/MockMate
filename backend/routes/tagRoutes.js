import express from 'express';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// CRITICAL: Protect all tag management routes strictly with RBAC ('admin')
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getTags)
  .post(createTag);

router.route('/:id')
  .get(getTagById)
  .put(updateTag)
  .delete(deleteTag);

export default router;
