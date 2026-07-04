const { test, describe, before, mock } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

const quarkusClient = require('../src/clients/quarkusClient');

describe('Auth routes', () => {
  let app;

  before(() => {
    app = createApp();
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });

  test('POST /auth/signup proxies to Quarkus', async () => {
    const signupMock = mock.method(quarkusClient, 'signup', async () => ({
      id: 1,
      email: 'test@example.com',
      verified: false,
    }));

    const res = await request(app)
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'SecurePass1' });

    assert.equal(res.status, 201);
    assert.equal(res.body.email, 'test@example.com');
    assert.equal(signupMock.mock.callCount(), 1);

    signupMock.mock.restore();
  });

  test('POST /auth/login does not create session when unverified', async () => {
    const loginMock = mock.method(quarkusClient, 'login', async () => ({
      id: 1,
      email: 'test@example.com',
      verified: false,
      message: 'You need to validate your email to access the portal',
    }));

    const agent = request.agent(app);
    const res = await agent
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass1' });

    assert.equal(res.status, 200);
    assert.equal(res.body.verified, false);

    const me = await agent.get('/auth/me');
    assert.equal(me.status, 401);

    loginMock.mock.restore();
  });

  test('POST /auth/login creates session when verified', async () => {
    const loginMock = mock.method(quarkusClient, 'login', async () => ({
      id: 1,
      email: 'test@example.com',
      verified: true,
      message: 'Your email is validated. You can access the portal',
    }));

    const agent = request.agent(app);
    const res = await agent
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass1' });

    assert.equal(res.status, 200);
    assert.equal(res.body.verified, true);

    const me = await agent.get('/auth/me');
    assert.equal(me.status, 200);
    assert.deepEqual(me.body, {
      id: 1,
      email: 'test@example.com',
      verified: true,
    });

    loginMock.mock.restore();
  });

  test('POST /auth/logout destroys session', async () => {
    const loginMock = mock.method(quarkusClient, 'login', async () => ({
      id: 1,
      email: 'test@example.com',
      verified: true,
      message: 'Your email is validated. You can access the portal',
    }));

    const agent = request.agent(app);
    await agent
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass1' });

    const logout = await agent.post('/auth/logout');
    assert.equal(logout.status, 200);

    const me = await agent.get('/auth/me');
    assert.equal(me.status, 401);

    loginMock.mock.restore();
  });

  test('POST /auth/verify proxies to Quarkus', async () => {
    const verifyMock = mock.method(quarkusClient, 'verifyOtp', async () => ({
      message: 'Email verified successfully',
    }));

    const res = await request(app)
      .post('/auth/verify')
      .send({ email: 'test@example.com', otp: '123456' });

    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Email verified successfully');
    assert.equal(verifyMock.mock.callCount(), 1);

    verifyMock.mock.restore();
  });
});
