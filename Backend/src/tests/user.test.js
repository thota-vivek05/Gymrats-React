const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { sessionRedisClient } = require('../server');
const { redisClient } = require('../middleware/redisCache');

const JWT_SECRET = 'gymrats-secret-key';

// ─── Helper: generate a fake user JWT (no DB lookup needed for protect middleware) ───
const makeUserToken = (overrides = {}) =>
  jwt.sign(
    { id: new mongoose.Types.ObjectId().toString(), email: 'user@test.com', role: 'user', name: 'Test', ...overrides },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

describe('User API Tests', () => {

  afterAll(async () => {
    await mongoose.connection.close();
    if (sessionRedisClient.isOpen) await sessionRedisClient.quit();
    if (redisClient.isOpen) await redisClient.quit();
  });

  // ── Auth middleware (protect) ─────────────────────────────────────────────

  it('GET /api/user/profile → 401 without token', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/exercises → 401 without token', async () => {
    const res = await request(app).get('/api/exercises');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/workout/today → 401 without token', async () => {
    const res = await request(app).get('/api/workout/today');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/nutrition/today → 401 without token', async () => {
    const res = await request(app).get('/api/nutrition/today');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/workout/weekly-stats → 401 without token', async () => {
    const res = await request(app).get('/api/workout/weekly-stats');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/exercise/progress → 401 without token', async () => {
    const res = await request(app).get('/api/exercise/progress');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/user/purchases → 401 without token', async () => {
    const res = await request(app).get('/api/user/purchases');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/membership/extend → 401 without token', async () => {
    const res = await request(app).post('/api/membership/extend').send({});
    expect(res.statusCode).toBe(401);
  });

  it('PUT /api/user/profile → 401 without token', async () => {
    const res = await request(app).put('/api/user/profile').send({});
    expect(res.statusCode).toBe(401);
  });

  it('PUT /api/user/password → 401 without token', async () => {
    const res = await request(app).put('/api/user/password').send({});
    expect(res.statusCode).toBe(401);
  });

  it('DELETE /api/user/account → 401 without token', async () => {
    const res = await request(app).delete('/api/user/account');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/user/trainer/rate → 401 without token', async () => {
    const res = await request(app).post('/api/user/trainer/rate').send({});
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/user/trainer/change → 401 without token', async () => {
    const res = await request(app).post('/api/user/trainer/change').send({});
    expect(res.statusCode).toBe(401);
  });

  // ── POST /signup validation ───────────────────────────────────────────────

  it('POST /signup → non-2xx when body is completely empty', async () => {
    const res = await request(app).post('/signup').send({});
    expect(res.statusCode).not.toBe(201);
    expect(res.statusCode).not.toBe(200);
  });

  it('POST /signup → non-2xx when required fields are missing', async () => {
    const res = await request(app).post('/signup').send({ email: 'partial@example.com' });
    expect(res.statusCode).not.toBe(201);
  });

  // ── 404 handler ───────────────────────────────────────────────────────────

  it('GET /api/unknown-random-route → 404', async () => {
    const res = await request(app).get('/api/unknown-random-route');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/does/not/exist → 404', async () => {
    const res = await request(app).get('/api/does/not/exist');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/nonexistent → 404', async () => {
    const res = await request(app).delete('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  // ── Membership routes (no-token variants) ────────────────────────────────

  it('GET /membership/status → 401 when no user info present', async () => {
    const res = await request(app).get('/membership/status');
    // This route uses session/user — no auth = 401
    expect(res.statusCode).toBe(401);
  });

  // ── Trainer appointment routes ────────────────────────────────────────────

  it('GET /api/user/appointments → 401 without token', async () => {
    const res = await request(app).get('/api/user/appointments');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/appointments/request → 401 without token', async () => {
    const res = await request(app).post('/api/appointments/request').send({});
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/workout/complete → 401 without token', async () => {
    const res = await request(app).post('/api/workout/complete').send({});
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/exercise/complete → 401 without token', async () => {
    const res = await request(app).post('/api/exercise/complete').send({});
    expect(res.statusCode).toBe(401);
  });
});
