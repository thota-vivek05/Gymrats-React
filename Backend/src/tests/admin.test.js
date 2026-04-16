const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { sessionRedisClient } = require('../server');

describe('Admin API Tests', () => {

  afterAll(async () => {
    // Close DB and Redis connections after tests to prevent hanging worker
    await mongoose.connection.close();
    if (sessionRedisClient.isOpen) await sessionRedisClient.quit();
  });

  it('GET /api/admin/login should allow access (unprotected route)', async () => {
    const res = await request(app).get('/api/admin/login');
    // Admin login page/endpoint should be accessible without auth
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/admin/dashboard should redirect or fail if unauthenticated', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    // The admin dashboard uses admin_Protect. Unauth users usually get 302 redirect or 401 error.
    expect(res.statusCode).not.toBe(200);
  });
});
