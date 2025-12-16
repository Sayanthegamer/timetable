import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import scheduleRoutes from './routes/schedule';
import lessonRoutes from './routes/lessons';
import prisma from './db';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'JEE Timetable API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/v1/auth',
      schedules: '/v1/schedule',
      lessons: '/v1/lessons',
    },
  });
});

app.use('/v1/auth', authRoutes);
app.use('/v1/schedule', scheduleRoutes);
app.use('/v1/lessons', lessonRoutes);

app.use(errorHandler);

export default app;
