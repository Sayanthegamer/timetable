import { Request, Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';
import { CreateLessonInput, UpdateLessonInput } from '../schemas/schedule';
import { emitScheduleUpdate } from '../socket';

export async function getLessons(req: AuthRequest, res: Response) {
  try {
    const { scheduleId, dayOfWeek } = req.query;

    const whereClause: any = {};

    if (scheduleId) {
      const schedule = await prisma.schedule.findFirst({
        where: {
          id: scheduleId as string,
          userId: req.user!.userId,
        },
      });

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      whereClause.scheduleId = scheduleId;
    } else {
      const userSchedules = await prisma.schedule.findMany({
        where: { userId: req.user!.userId },
        select: { id: true },
      });

      whereClause.scheduleId = {
        in: userSchedules.map(s => s.id),
      };
    }

    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek;
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
      include: {
        schedule: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    res.json({ lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
}

export async function getLesson(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findFirst({
      where: { id },
      include: {
        schedule: true,
      },
    });

    if (!lesson || lesson.schedule.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
}

export async function createLesson(req: AuthRequest, res: Response) {
  try {
    const lessonData = req.body as CreateLessonInput & { scheduleId: string };

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: lessonData.scheduleId,
        userId: req.user!.userId,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const lesson = await prisma.lesson.create({
      data: lessonData,
      include: {
        schedule: true,
      },
    });

    await prisma.syncMetadata.update({
      where: { scheduleId: lessonData.scheduleId },
      data: {
        lastSyncedAt: new Date(),
        syncVersion: { increment: 1 },
      },
    });

    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id: lessonData.scheduleId },
      include: { lessons: true },
    });

    if (updatedSchedule) {
      emitScheduleUpdate(req.user!.userId, updatedSchedule);
    }

    res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
}

export async function updateLesson(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateLessonInput;

    const existingLesson = await prisma.lesson.findFirst({
      where: { id },
      include: { schedule: true },
    });

    if (!existingLesson || existingLesson.schedule.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updates,
      include: {
        schedule: true,
      },
    });

    await prisma.syncMetadata.update({
      where: { scheduleId: lesson.scheduleId },
      data: {
        lastSyncedAt: new Date(),
        syncVersion: { increment: 1 },
      },
    });

    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id: lesson.scheduleId },
      include: { lessons: true },
    });

    if (updatedSchedule) {
      emitScheduleUpdate(req.user!.userId, updatedSchedule);
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
}

export async function deleteLesson(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const existingLesson = await prisma.lesson.findFirst({
      where: { id },
      include: { schedule: true },
    });

    if (!existingLesson || existingLesson.schedule.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const scheduleId = existingLesson.scheduleId;

    await prisma.lesson.delete({
      where: { id },
    });

    await prisma.syncMetadata.update({
      where: { scheduleId },
      data: {
        lastSyncedAt: new Date(),
        syncVersion: { increment: 1 },
      },
    });

    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { lessons: true },
    });

    if (updatedSchedule) {
      emitScheduleUpdate(req.user!.userId, updatedSchedule);
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
}
