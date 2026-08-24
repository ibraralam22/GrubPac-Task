import { describe, it, expect, beforeAll } from 'vitest';
import { request } from '../setup';
import { prisma } from '../../src/config/prisma';
import { getJobStatusById } from '../../src/jobs/queue';

describe('Integration Tests: Background Queue Job Creation on Task Assignment', () => {
  let adminToken: string;
  let taskId: string;
  let memberUserId: string;

  beforeAll(async () => {
    // 1. Authenticate Acme Admin
    const loginRes = await request.post('/auth/login').send({
      email: 'admin1@acme.com',
      password: 'Password123!',
    });
    adminToken = loginRes.body.data.tokens.accessToken;
    const orgId = loginRes.body.data.organization.id;

    // Get Acme member user
    const member = await prisma.user.findUnique({ where: { email: 'member1@acme.com' } });
    memberUserId = member!.id;

    // Get an Acme task
    const task = await prisma.task.findFirst({ where: { project: { orgId } } });
    taskId = task!.id;
  });

  it('POST /tasks/:id/assign should persist assignment and enqueue a BullMQ background job', async () => {
    const res = await request
      .post(`/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: memberUserId });

    expect(res.status).toBe(200);
    expect(res.body.data.taskId).toBe(taskId);
    expect(res.body.data.userId).toBe(memberUserId);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.id).toBeDefined();
    expect(res.body.job.enqueued).toBe(true);

    const jobId = res.body.job.id;

    // Verify job exists in BullMQ queue
    const jobInfo = await getJobStatusById(jobId);
    expect(jobInfo).toBeDefined();
    expect(jobInfo?.jobId).toBe(jobId);
    expect(jobInfo?.data.taskId).toBe(taskId);
    expect(jobInfo?.data.userId).toBe(memberUserId);
    expect(['pending', 'active', 'completed']).toContain(jobInfo?.status);
  });

  it('GET /jobs/:id should return job status and metadata', async () => {
    const assignRes = await request
      .post(`/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: memberUserId });

    const jobId = assignRes.body.job.id;

    const res = await request
      .get(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.jobId).toBe(jobId);
    expect(res.body.data.data.taskId).toBe(taskId);
    expect(['pending', 'active', 'completed', 'failed']).toContain(res.body.data.status);
  });
});
