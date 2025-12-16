import { Request, Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';
import { CreateScheduleInput, UpdateScheduleInput } from '../schemas/schedule';
import { emitScheduleUpdate } from '../socket';

export async function getSchedules(req: AuthRequest, res: Response) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: req.user!.userId },
      include: {
        lessons: {
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        },
        syncMetadata: true,
      },
    });

    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
}

export async function getSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      include: {
        lessons: {
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        },
        syncMetadata: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
}

export async function createSchedule(req: AuthRequest, res: Response) {
  try {
    const { name, timezone } = req.body as CreateScheduleInput;

    const schedule = await prisma.schedule.create({
      data: {
        userId: req.user!.userId,
        name,
        timezone,
      },
      include: {
        lessons: true,
        syncMetadata: true,
      },
    });

    await prisma.syncMetadata.create({
      data: {
        scheduleId: schedule.id,
        lastSyncedAt: new Date(),
        syncVersion: 1,
      },
    });

    res.status(201).json({ schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
}

export async function updateSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateScheduleInput;

    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updates,
      include: {
        lessons: {
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
        },
        syncMetadata: true,
      },
    });

    await prisma.syncMetadata.update({
      where: { scheduleId: id },
      data: {
        lastSyncedAt: new Date(),
        syncVersion: { increment: 1 },
      },
    });

    emitScheduleUpdate(req.user!.userId, schedule);

    res.json({ schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
}

export async function deleteSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    });

    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    await prisma.schedule.delete({
      where: { id },
    });

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
}

export async function syncSchedule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updatedSince = req.query.updated_since as string | undefined;

    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      include: {
        lessons: {
          orderBy: [{ dayOfWeek: 'asc' }, { order: 'asc' }],
          ...(updatedSince && {
            where: {
              updatedAt: {
                gte: new Date(updatedSince),
              },
            },
          }),
        },
        syncMetadata: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      schedule,
      syncMetadata: schedule.syncMetadata,
    });
  } catch (error) {
    console.error('Sync schedule error:', error);
    res.status(500).json({ error: 'Failed to sync schedule' });
  }
}
