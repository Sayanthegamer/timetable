import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { config } from '../config';

let io: SocketIOServer | null = null;

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function initializeSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Client connected: ${socket.id}, User: ${socket.userId}`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('join:schedule', (scheduleId: string) => {
      socket.join(`schedule:${scheduleId}`);
      console.log(`User ${socket.userId} joined schedule room: ${scheduleId}`);
    });

    socket.on('leave:schedule', (scheduleId: string) => {
      socket.leave(`schedule:${scheduleId}`);
      console.log(`User ${socket.userId} left schedule room: ${scheduleId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitScheduleUpdate(userId: string, schedule: any) {
  if (!io) return;

  io.to(`user:${userId}`).emit('schedule:updated', {
    scheduleId: schedule.id,
    schedule,
    timestamp: new Date().toISOString(),
  });

  io.to(`schedule:${schedule.id}`).emit('schedule:updated', {
    scheduleId: schedule.id,
    schedule,
    timestamp: new Date().toISOString(),
  });
}

export function emitLessonUpdate(userId: string, scheduleId: string, lesson: any, action: 'created' | 'updated' | 'deleted') {
  if (!io) return;

  const event = `lesson:${action}`;
  const payload = {
    scheduleId,
    lesson,
    timestamp: new Date().toISOString(),
  };

  io.to(`user:${userId}`).emit(event, payload);
  io.to(`schedule:${scheduleId}`).emit(event, payload);
}
