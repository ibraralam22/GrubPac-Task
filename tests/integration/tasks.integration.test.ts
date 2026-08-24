import { describe, it, expect, beforeAll } from 'vitest';
import { request } from '../setup';
import { prisma } from '../../src/config/prisma';

describe('Integration Tests: Projects & Tasks CRUD, Filters, and Soft Delete', () => {
  let adminToken: string;
  let orgId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    // Login as seeded admin user
    const res = await request.post('/auth/login').send({
      email: 'admin1@acme.com',
      password: 'Password123!',
    });
    adminToken = res.body.data.tokens.accessToken;
    orgId = res.body.data.organization.id;
  });

  it('POST /projects should create a new project', async () => {
    const res = await request
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Automated Test Project',
        description: 'Project created during integration testing',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Automated Test Project');
    expect(res.body.data.orgId).toBe(orgId);
    projectId = res.body.data.id;
  });

  it('GET /projects should list organization projects with pagination', async () => {
    const res = await request
      .get('/projects?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('POST /tasks should create a new task in the project', async () => {
    const res = await request
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        projectId,
        title: 'Perform Security Vulnerability Audit',
        description: 'Comprehensive static code analysis and dependency checking',
        status: 'todo',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Perform Security Vulnerability Audit');
    expect(res.body.data.priority).toBe('urgent');
    taskId = res.body.data.id;
  });

  it('GET /tasks should filter tasks by status and priority', async () => {
    const res = await request
      .get(`/tasks?projectId=${projectId}&priority=urgent`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].priority).toBe('urgent');
  });

  it('GET /tasks should perform full-text search using search query (q)', async () => {
    const res = await request
      .get('/tasks?q=Vulnerability')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((t: any) => t.id === taskId)).toBe(true);
  });

  it('PATCH /tasks/:id should update task details', async () => {
    const res = await request
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'in_progress',
        title: 'Perform Security Vulnerability Audit (Updated)',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.title).toContain('(Updated)');
  });

  it('PATCH /tasks/bulk-status should atomically update multiple tasks', async () => {
    const res = await request
      .patch('/tasks/bulk-status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        taskIds: [taskId],
        status: 'review',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('review');
    expect(res.body.data.updatedCount).toBe(1);
  });

  it('GET /projects/:id/dashboard should compute status aggregation', async () => {
    const res = await request
      .get(`/projects/${projectId}/dashboard`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalTasks).toBeGreaterThanOrEqual(1);
    expect(res.body.data.taskCountsByStatus.review).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /tasks/:id should soft-delete the task', async () => {
    const res = await request
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);

    // Regular GET should now return 404 (deleted)
    const getRes = await request
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(404);
  });
});
