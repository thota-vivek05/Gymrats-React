const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { sessionRedisClient } = require('../server');
const { redisClient } = require('../middleware/redisCache');

afterAll(async () => {
  // Single shared teardown for all suites in this file
  await mongoose.connection.close();
  if (sessionRedisClient.isOpen) await sessionRedisClient.quit();
  if (redisClient.isOpen) await redisClient.quit();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('Admin API Tests', () => {

  // ── Public admin routes ───────────────────────────────────────────────────

  it('GET /api/admin/login → 200 (public, no auth required)', async () => {
    const res = await request(app).get('/api/admin/login');
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/admin/login → non-2xx with empty credentials', async () => {
    const res = await request(app).post('/api/admin/login').send({});
    expect(res.statusCode).not.toBe(200);
  });

  it('POST /api/admin/login → non-2xx with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'fake@admin.com', password: 'wrongpass' });
    expect(res.statusCode).not.toBe(200);
  });

  it('GET /api/admin/logout → does not crash (public route)', async () => {
    const res = await request(app).get('/api/admin/logout');
    expect(res.statusCode).toBeLessThan(500);
  });

  // ── Protected admin routes — must require auth ────────────────────────────

  it('GET /api/admin/dashboard → non-200 without token', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.statusCode).not.toBe(200);
  });

  it('GET /api/admin/users → 401 without token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/trainers → 401 without token', async () => {
    const res = await request(app).get('/api/admin/trainers');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/exercises → 401 without token', async () => {
    const res = await request(app).get('/api/admin/exercises');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/memberships → 401 without token', async () => {
    const res = await request(app).get('/api/admin/memberships');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/trainer-applications → 401 without token', async () => {
    const res = await request(app).get('/api/admin/trainer-applications');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/admin/users → 401 without token', async () => {
    const res = await request(app).post('/api/admin/users').send({});
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/admin/exercises → 401 without token', async () => {
    const res = await request(app).post('/api/admin/exercises').send({});
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/verifiers → 401 without token', async () => {
    const res = await request(app).get('/api/admin/verifiers');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/ratings/top-exercises → 401 without token', async () => {
    const res = await request(app).get('/api/admin/ratings/top-exercises');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/ratings/trainer-leaderboard → 401 without token', async () => {
    const res = await request(app).get('/api/admin/ratings/trainer-leaderboard');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/trainer-change-requests → 401 without token', async () => {
    const res = await request(app).get('/api/admin/trainer-change-requests');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/admin/reassignment/poorly-rated-trainers → 401 without token', async () => {
    const res = await request(app).get('/api/admin/reassignment/poorly-rated-trainers');
    expect(res.statusCode).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('Trainer API Tests', () => {

  it('POST /api/trainer/signup → non-2xx when body is empty', async () => {
    const res = await request(app).post('/api/trainer/signup').send({});
    expect(res.statusCode).not.toBe(200);
    expect(res.statusCode).not.toBe(201);
  });

  it('GET /api/trainer/clients → 401 without token', async () => {
    const res = await request(app).get('/api/trainer/clients');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/trainer/stats → 401 without token', async () => {
    const res = await request(app).get('/api/trainer/stats');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/trainer/appointments → 401 without token', async () => {
    const res = await request(app).get('/api/trainer/appointments');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/trainer/availability → 401 without token', async () => {
    const res = await request(app).post('/api/trainer/availability').send({});
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/trainer/business-kpis → 401 without token', async () => {
    const res = await request(app).get('/api/trainer/business-kpis');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/trainer/expiring-clients → 401 without token', async () => {
    const res = await request(app).get('/api/trainer/expiring-clients');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/trainer/save-workout-plan → 401 without token', async () => {
    const res = await request(app).post('/api/trainer/save-workout-plan').send({});
    expect(res.statusCode).toBe(401);
  });
});

