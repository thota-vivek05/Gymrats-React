const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Admin API Tests', () => {

  afterAll(async () => {
    // Close DB connection after tests
    await mongoose.connection.close();
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
