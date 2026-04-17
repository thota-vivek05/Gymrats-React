const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { sessionRedisClient } = require('../server');
const { redisClient } = require('../middleware/redisCache');

const JWT_SECRET = 'gymrats-secret-key';

describe('Auth API Tests', () => {

  afterAll(async () => {
    await mongoose.connection.close();
    if (sessionRedisClient.isOpen) await sessionRedisClient.quit();
    if (redisClient.isOpen) await redisClient.quit();
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────────

  it('POST /api/auth/login → 400 when missing email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'abc', role: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login → 400 when missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', role: 'user' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login → 400 when missing role', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'abc' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login → 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login → 400 for invalid role value', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'abc', role: 'superadmin' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid role/i);
  });

  it('POST /api/auth/login → 400 for non-existent user credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent_xyz@example.com', password: 'wrongpass123', role: 'user' });
    // User not found → 401; or 400 from validation — both are failures
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('POST /api/auth/login → 400 for non-existent trainer credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake_trainer_xyz@example.com', password: 'wrongpass', role: 'trainer' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // ── GET /api/auth/profile (verifyToken middleware) ────────────────────────

  it('GET /api/auth/profile → 401 when no Authorization header is sent', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/profile → 400 when token is malformed', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer this.is.not.a.valid.jwt');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid token/i);
  });

  it('GET /api/auth/profile → 200 with valid token', async () => {
    // Generate a valid token using the same secret the controller uses
    const token = jwt.sign(
      { id: new mongoose.Types.ObjectId(), email: 'test@example.com', role: 'user', name: 'Test User' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('GET /api/auth/profile → 200 and returns role from token', async () => {
    const token = jwt.sign(
      { id: new mongoose.Types.ObjectId(), email: 'trainer@example.com', role: 'trainer', name: 'Trainer One' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('trainer');
  });
});
