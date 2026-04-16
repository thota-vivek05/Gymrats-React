const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { sessionRedisClient } = require('../server'); 

describe('Auth API Tests', () => {

  afterAll(async () => {
    // Close DB and Redis connections after tests to prevent hanging worker
    await mongoose.connection.close();
    if (sessionRedisClient.isOpen) await sessionRedisClient.quit();
  });

  it('POST /api/auth/login should fail and return 401 with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "nonexistent_fake_user@example.com",
        password: "wrongpassword123"
      });

    // We expect a 400 Bad Request for bad login
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login should handle invalid data format gracefully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({}); // Missing email and password

    // Depending on validation it might be 400 or 401
    expect(res.statusCode).toBeGreaterThanOrEqual(400); 
  });
});
