import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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

// Apply authentication middleware
router.use(authenticate);

// Apply rate limiting to all schedule routes after authentication
const scheduleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each user to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});
router.use(scheduleLimiter);

router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.post('/', validate(createScheduleSchema), createSchedule);
router.patch('/:id', validate(updateScheduleSchema), updateSchedule);
router.delete('/:id', deleteSchedule);
router.get('/:id/sync', syncSchedule);

export default router;
