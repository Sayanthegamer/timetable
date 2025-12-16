import { Router } from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  syncSchedule,
} from '../controllers/schedule';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createScheduleSchema, updateScheduleSchema } from '../schemas/schedule';

const router = Router();

router.use(authenticate);

router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.post('/', validate(createScheduleSchema), createSchedule);
router.patch('/:id', validate(updateScheduleSchema), updateSchedule);
router.delete('/:id', deleteSchedule);
router.get('/:id/sync', syncSchedule);

export default router;
