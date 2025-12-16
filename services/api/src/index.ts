import http from 'http';
import app from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { initializeSocket } from './socket';

const server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  try {
    await connectDatabase();

    server.listen(config.port, () => {
      console.log('🚀 Server Information:');
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   API URL: http://localhost:${config.port}`);
      console.log(`   Health Check: http://localhost:${config.port}/health`);
      console.log('\n📚 Available Endpoints:');
      console.log('   POST   /v1/auth/register');
      console.log('   POST   /v1/auth/login');
      console.log('   POST   /v1/auth/refresh');
      console.log('   POST   /v1/auth/logout');
      console.log('   GET    /v1/schedule');
      console.log('   GET    /v1/schedule/:id');
      console.log('   POST   /v1/schedule');
      console.log('   PATCH  /v1/schedule/:id');
      console.log('   DELETE /v1/schedule/:id');
      console.log('   GET    /v1/schedule/:id/sync?updated_since=<ISO_DATE>');
      console.log('   GET    /v1/lessons');
      console.log('   GET    /v1/lessons/:id');
      console.log('   POST   /v1/lessons');
      console.log('   PATCH  /v1/lessons/:id');
      console.log('   DELETE /v1/lessons/:id');
      console.log('\n🔌 WebSocket Events:');
      console.log('   schedule:updated');
      console.log('   lesson:created');
      console.log('   lesson:updated');
      console.log('   lesson:deleted');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
});

startServer();
