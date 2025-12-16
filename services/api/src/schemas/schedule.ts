import { z } from 'zod';

export const createScheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  timezone: z.string().default('Asia/Kolkata'),
});

export const updateScheduleSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createLessonSchema = z.object({
  dayOfWeek: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  subject: z.string().min(1, 'Subject is required'),
  details: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  order: z.number().int().default(0),
});

export const updateLessonSchema = z.object({
  dayOfWeek: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  subject: z.string().optional(),
  details: z.string().optional(),
  type: z.string().optional(),
  order: z.number().int().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
