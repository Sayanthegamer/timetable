import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';

describe('Schedule Endpoints', () => {
  const testUser = {
    email: `schedule-test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Schedule Test User',
  };

  let accessToken: string;
  let userId: string;
  let scheduleId: string;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/v1/auth/register')
      .send(testUser);

    accessToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  describe('POST /v1/schedule', () => {
    it('should create a new schedule', async () => {
      const response = await request(app)
        .post('/v1/schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Schedule',
          timezone: 'Asia/Kolkata',
        })
        .expect(201);

      expect(response.body.schedule).toHaveProperty('id');
      expect(response.body.schedule.name).toBe('Test Schedule');
      scheduleId = response.body.schedule.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/v1/schedule')
        .send({
          name: 'Test Schedule',
        })
        .expect(401);
    });
  });

  describe('GET /v1/schedule', () => {
    it('should get all user schedules', async () => {
      const response = await request(app)
        .get('/v1/schedule')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('schedules');
      expect(Array.isArray(response.body.schedules)).toBe(true);
      expect(response.body.schedules.length).toBeGreaterThan(0);
    });
  });

  describe('GET /v1/schedule/:id', () => {
    it('should get a specific schedule', async () => {
      const response = await request(app)
        .get(`/v1/schedule/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.schedule.id).toBe(scheduleId);
      expect(response.body.schedule).toHaveProperty('lessons');
    });

    it('should return 404 for non-existent schedule', async () => {
      await request(app)
        .get('/v1/schedule/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /v1/schedule/:id', () => {
    it('should update a schedule', async () => {
      const response = await request(app)
        .patch(`/v1/schedule/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Schedule Name',
        })
        .expect(200);

      expect(response.body.schedule.name).toBe('Updated Schedule Name');
    });
  });

  describe('GET /v1/schedule/:id/sync', () => {
    it('should sync schedule data', async () => {
      const response = await request(app)
        .get(`/v1/schedule/${scheduleId}/sync`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('schedule');
      expect(response.body).toHaveProperty('syncMetadata');
    });

    it('should support updated_since query parameter', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await request(app)
        .get(`/v1/schedule/${scheduleId}/sync?updated_since=${yesterday}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('schedule');
    });
  });

  describe('DELETE /v1/schedule/:id', () => {
    it('should delete a schedule', async () => {
      await request(app)
        .delete(`/v1/schedule/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await request(app)
        .get(`/v1/schedule/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
