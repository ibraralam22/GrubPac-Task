import { describe, it, expect, beforeAll } from 'vitest';
import { request } from '../setup';
import { prisma } from '../../src/config/prisma';

describe('Integration Tests: Multi-Tenant Isolation & 403 Security Checks', () => {
  let acmeToken: string;
  let globexToken: string;
  let acmeOrgId: string;
  let globexOrgId: string;
  let acmeProjectId: string;
  let globexProjectId: string;
  let acmeTaskId: string;
  let globexTaskId: string;
  let globexUserId: string;

  beforeAll(async () => {
    // 1. Authenticate Acme Admin
    const acmeLogin = await request.post('/auth/login').send({
      email: 'admin1@acme.com',
      password: 'Password123!',
    });
    acmeToken = acmeLogin.body.data.tokens.accessToken;
    acmeOrgId = acmeLogin.body.data.organization.id;

    // 2. Authenticate Globex Admin
    const globexLogin = await request.post('/auth/login').send({
      email: 'admin2@globex.com',
      password: 'Password123!',
    });
    globexToken = globexLogin.body.data.tokens.accessToken;
    globexOrgId = globexLogin.body.data.organization.id;

    // Fetch user IDs and projects
    const globexUser = await prisma.user.findUnique({ where: { email: 'member3@globex.com' } });
    globexUserId = globexUser!.id;

    const acmeProj = await prisma.project.findFirst({ where: { orgId: acmeOrgId } });
    acmeProjectId = acmeProj!.id;

    const globexProj = await prisma.project.findFirst({ where: { orgId: globexOrgId } });
    globexProjectId = globexProj!.id;

    const acmeTask = await prisma.task.findFirst({ where: { project: { orgId: acmeOrgId } } });
    acmeTaskId = acmeTask!.id;

    const globexTask = await prisma.task.findFirst({ where: { project: { orgId: globexOrgId } } });
    globexTaskId = globexTask!.id;
  });

  it('Acme user accessing Globex project directly must return 403 Forbidden', async () => {
    const res = await request
      .get(`/projects/${globexProjectId}`)
      .set('Authorization', `Bearer ${acmeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CROSS_TENANT_ACCESS_FORBIDDEN');
    expect(res.body.data).toBeUndefined(); // Ensures sensitive data is NOT exposed
  });

  it('Acme user accessing Globex task directly must return 403 Forbidden', async () => {
    const res = await request
      .get(`/tasks/${globexTaskId}`)
      .set('Authorization', `Bearer ${acmeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CROSS_TENANT_ACCESS_FORBIDDEN');
  });

  it('Acme user updating Globex task must return 403 Forbidden', async () => {
    const res = await request
      .patch(`/tasks/${globexTaskId}`)
      .set('Authorization', `Bearer ${acmeToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CROSS_TENANT_ACCESS_FORBIDDEN');
  });

  it('Assigning a Globex user to an Acme task must return 403 Forbidden', async () => {
    const res = await request
      .post(`/tasks/${acmeTaskId}/assign`)
      .set('Authorization', `Bearer ${acmeToken}`)
      .send({ userId: globexUserId });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CROSS_TENANT_ASSIGNMENT_FORBIDDEN');
  });

  it('Passing x-organization-id header for an unauthorized organization must return 403 Forbidden', async () => {
    const res = await request
      .get('/auth/me')
      .set('Authorization', `Bearer ${acmeToken}`)
      .set('x-organization-id', globexOrgId);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CROSS_TENANT_ACCESS_FORBIDDEN');
  });
});
