import { describe, it, expect } from 'vitest';
import { request } from '../setup';
import { prisma } from '../../src/config/prisma';

describe('Integration Tests: Authentication Flow', () => {
  const testUser = {
    email: `integration-test-${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Integration Tester',
    organizationName: 'Integration Org',
  };

  let accessToken: string;
  let refreshToken: string;

  it('POST /auth/register should register a new user and create an organization', async () => {
    const res = await request.post('/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.organization.name).toBe(testUser.organizationName);
    expect(res.body.data.organization.role).toBe('org_admin');
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /auth/register should fail on duplicate email', async () => {
    const res = await request.post('/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('USER_EMAIL_EXISTS');
  });

  it('POST /auth/login should authenticate with valid credentials', async () => {
    const res = await request.post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /auth/login should fail on incorrect password', async () => {
    const res = await request.post('/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /auth/me should return current authenticated user & org context', async () => {
    const res = await request
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.organization.role).toBe('org_admin');
  });

  it('POST /auth/refresh should perform token rotation and issue new tokens', async () => {
    const res = await request.post('/auth/refresh').send({
      refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).not.toBe(refreshToken);

    const newRefreshToken = res.body.data.tokens.refreshToken;

    // Reusing the old revoked refresh token should trigger compromise detection!
    const reuseRes = await request.post('/auth/refresh').send({
      refreshToken,
    });

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.code).toBe('REFRESH_TOKEN_REUSED');
  });

  it('POST /auth/logout should revoke the refresh token', async () => {
    // Generate fresh session
    const loginRes = await request.post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    const sessionRefresh = loginRes.body.data.tokens.refreshToken;

    const logoutRes = await request.post('/auth/logout').send({
      refreshToken: sessionRefresh,
    });
    expect(logoutRes.status).toBe(200);

    // Refresh with logged out token should fail
    const refreshRes = await request.post('/auth/refresh').send({
      refreshToken: sessionRefresh,
    });
    expect(refreshRes.status).toBe(401);
  });
});
