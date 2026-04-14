const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('User API Tests', () => {
  afterAll(async () => {
    // Close DB connection after tests
    await mongoose.connection.close();
  });

  it('GET /api/user/profile should return 401 when missing auth token', async () => {
    const res = await request(app).get('/api/user/profile');
    // The protect middleware should reject this request
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/exercises should prevent unauthorized access', async () => {
    const res = await request(app).get('/api/exercises');
    expect(res.statusCode).toBe(401);
  });

  it('POST /signup should fail if data is completely empty', async () => {
    const res = await request(app)
      .post('/signup')
      .send({});
    // Should fail validation and return 400 or 500 error
    expect(res.statusCode).not.toBe(201); 
    expect(res.statusCode).not.toBe(200); 
  });

  it('GET /api/unknown-random-route should return 404', async () => {
    const res = await request(app).get('/api/unknown-random-route');
    expect(res.statusCode).toBe(404);
  });
});
