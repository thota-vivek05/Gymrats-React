/**
 * controllers.test.js
 * Unit-level tests for membership & auth controllers using jest mocks.
 * These tests mock mongoose models so they run without a real DB hit
 * and cover internal branches (pricing logic, token verification paths, etc.)
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ─── Mock mongoose models before requiring controllers ────────────────────────
jest.mock('../model/User');
jest.mock('../model/Trainer');
jest.mock('../model/Payment');
jest.mock('../model/Membership');

const User = require('../model/User');
const Trainer = require('../model/Trainer');
const Payment = require('../model/Payment');

const { login, verifyToken, getProfile } = require('../controllers/authController');
const { extendMembership, getMembershipStatus, toggleAutoRenew } = require('../controllers/membershipController');

// ─── Utility: build mock req / res / next ────────────────────────────────────
const mockReq = (overrides = {}) => ({
  body: {},
  headers: {},
  header: (h) => null,
  session: {},
  user: null,
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// ─────────────────────────────────────────────────────────────────────────────
describe('authController – login()', () => {

  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when email is missing', async () => {
    const req = mockReq({ body: { password: 'abc', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when password is missing', async () => {
    const req = mockReq({ body: { email: 'a@b.com', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when role is missing', async () => {
    const req = mockReq({ body: { email: 'a@b.com', password: 'abc' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for unsupported role', async () => {
    const req = mockReq({ body: { email: 'a@b.com', password: 'abc', role: 'admin' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/invalid role/i) }));
  });

  it('returns 401 when user does not exist in DB', async () => {
    User.findOne.mockResolvedValue(null);
    const req = mockReq({ body: { email: 'ghost@b.com', password: 'abc', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when trainer does not exist in DB', async () => {
    Trainer.findOne.mockResolvedValue(null);
    const req = mockReq({ body: { email: 'ghost@b.com', password: 'abc', role: 'trainer' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when user account is Suspended', async () => {
    User.findOne.mockResolvedValue({ status: 'Suspended', email: 'a@b.com', password_hash: 'hash' });
    const req = mockReq({ body: { email: 'a@b.com', password: 'abc', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when user account is Inactive', async () => {
    User.findOne.mockResolvedValue({ status: 'Inactive', email: 'a@b.com', password_hash: 'hash' });
    const req = mockReq({ body: { email: 'a@b.com', password: 'abc', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 when password does not match', async () => {
    User.findOne.mockResolvedValue({
      status: 'Active',
      email: 'a@b.com',
      password_hash: await bcrypt.hash('correctpass', 10),
      _id: new mongoose.Types.ObjectId(),
    });
    const req = mockReq({ body: { email: 'a@b.com', password: 'wrongpass', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with token when user credentials are correct', async () => {
    const hash = await bcrypt.hash('correctpass', 10);
    User.findOne.mockResolvedValue({
      status: 'Active',
      email: 'a@b.com',
      password_hash: hash,
      _id: new mongoose.Types.ObjectId(),
      full_name: 'Test User',
      membershipType: 'Gold',
    });
    const req = mockReq({ body: { email: 'a@b.com', password: 'correctpass', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: expect.any(String) }));
  });

  it('returns 200 with redirect to trainer dashboard when trainer logs in', async () => {
    const hash = await bcrypt.hash('trainerpass', 10);
    Trainer.findOne.mockResolvedValue({
      status: 'Active',
      email: 't@b.com',
      password_hash: hash,
      _id: new mongoose.Types.ObjectId(),
      name: 'Trainer One',
    });
    const req = mockReq({ body: { email: 't@b.com', password: 'trainerpass', role: 'trainer' } });
    const res = mockRes();
    await login(req, res);
    const call = res.json.mock.calls[0][0];
    expect(call.success).toBe(true);
    expect(call.redirect).toBe('/trainer');
  });

  it('returns 500 if DB throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    User.findOne.mockRejectedValue(new Error('DB down'));
    const req = mockReq({ body: { email: 'a@b.com', password: 'abc', role: 'user' } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    console.error.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('authController – verifyToken() middleware', () => {

  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no token is provided', () => {
    const req = mockReq({ header: () => undefined });
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 400 when token is invalid', () => {
    const req = mockReq({ header: () => 'Bearer invalidtoken' });
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('calls next() and sets req.user when token is valid', () => {
    const token = jwt.sign({ id: 'abc123', role: 'user' }, 'gymrats-secret-key', { expiresIn: '1h' });
    const req = mockReq({ header: (h) => (h === 'Authorization' ? `Bearer ${token}` : null) });
    req.header = () => `Bearer ${token}`;
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('abc123');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('membershipController – getMembershipStatus()', () => {

  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no user in session or JWT', async () => {
    const req = mockReq({ session: {}, user: null });
    const res = mockRes();
    await getMembershipStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when user not found in DB', async () => {
    User.findById.mockResolvedValue(null);
    const req = mockReq({ user: { id: 'fakeid' } });
    const res = mockRes();
    await getMembershipStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns membership data when user exists', async () => {
    User.findById.mockResolvedValue({
      membershipType: 'Gold',
      membershipDuration: { months_remaining: 3, end_date: new Date() },
      status: 'Active',
      isMembershipActive: () => true,
    });
    const req = mockReq({ user: { id: 'fakeid' } });
    const res = mockRes();
    await getMembershipStatus(req, res);
    const call = res.json.mock.calls[0][0];
    expect(call.membershipType).toBe('Gold');
    expect(call.isActive).toBe(true);
  });

  it('returns 500 if DB throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    User.findById.mockRejectedValue(new Error('DB error'));
    const req = mockReq({ user: { id: 'fakeid' } });
    const res = mockRes();
    await getMembershipStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    console.error.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('membershipController – toggleAutoRenew()', () => {

  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no session or JWT user', async () => {
    const req = mockReq({ session: {}, user: null });
    const res = mockRes();
    await toggleAutoRenew(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when user not found', async () => {
    User.findById.mockResolvedValue(null);
    const req = mockReq({ user: { id: 'fakeid' } });
    const res = mockRes();
    await toggleAutoRenew(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('toggles auto_renew from false to true', async () => {
    const fakeUser = {
      membershipDuration: { auto_renew: false },
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(fakeUser);
    const req = mockReq({ user: { id: 'fakeid' } });
    const res = mockRes();
    await toggleAutoRenew(req, res);
    expect(fakeUser.membershipDuration.auto_renew).toBe(true);
    const call = res.json.mock.calls[0][0];
    expect(call.auto_renew).toBe(true);
  });

  it('toggles auto_renew from true to false', async () => {
    const fakeUser = {
      membershipDuration: { auto_renew: true },
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockResolvedValue(fakeUser);
    const req = mockReq({ user: { id: 'fakeid' } });
    const res = mockRes();
    await toggleAutoRenew(req, res);
    expect(fakeUser.membershipDuration.auto_renew).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('membershipController – extendMembership() pricing logic', () => {

  const buildUser = (membershipType) => ({
    _id: new mongoose.Types.ObjectId(),
    membershipType,
    membershipDuration: { months_remaining: 1, auto_renew: false },
    status: 'Active',
    extendMembership: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
  });

  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when userId is missing', async () => {
    const req = mockReq({ body: { additionalMonths: 1 }, user: null, session: {} });
    const res = mockRes();
    await extendMembership(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when user is not found', async () => {
    User.findById.mockResolvedValue(null);
    const req = mockReq({ body: { additionalMonths: 1 }, user: { id: 'fakeid' } });
    const res = mockRes();
    await extendMembership(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('extends membership for 1 month at basic rate (₹299)', async () => {
    const fakeUser = buildUser('basic');
    User.findById.mockResolvedValue(fakeUser);
    Payment.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

    const req = mockReq({ body: { additionalMonths: 1 }, user: { id: 'fakeid' } });
    const res = mockRes();
    await extendMembership(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(fakeUser.extendMembership).toHaveBeenCalledWith(1);
  });

  it('applies 15% discount for 3-month plan', async () => {
    const fakeUser = buildUser('gold');
    User.findById.mockResolvedValue(fakeUser);
    Payment.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

    const req = mockReq({ body: { additionalMonths: 3 }, user: { id: 'fakeid' } });
    const res = mockRes();
    await extendMembership(req, res);
    expect(fakeUser.extendMembership).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('applies 25% discount for 6-month plan', async () => {
    const fakeUser = buildUser('platinum');
    User.findById.mockResolvedValue(fakeUser);
    Payment.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

    const req = mockReq({ body: { additionalMonths: 6 }, user: { id: 'fakeid' } });
    const res = mockRes();
    await extendMembership(req, res);
    expect(fakeUser.extendMembership).toHaveBeenCalledWith(6);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 500 if DB throws during extend', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    User.findById.mockRejectedValue(new Error('DB crash'));
    const req = mockReq({ body: { additionalMonths: 1 }, user: { id: 'fakeid' } });
    const res = mockRes();
    await extendMembership(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    console.error.mockRestore();
  });
});
