import { Router } from 'express';
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessons';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createLessonSchema, updateLessonSchema } from '../schemas/schedule';

const router = Router();

router.use(authenticate);

router.get('/', getLessons);
router.get('/:id', getLesson);
router.post('/', validate(createLessonSchema), createLesson);
router.patch('/:id', validate(updateLessonSchema), updateLesson);
router.delete('/:id', deleteLesson);

export default router;
