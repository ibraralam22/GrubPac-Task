import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from './redis';
import {
  EMAIL_NOTIFICATIONS_QUEUE,
  EMAIL_NOTIFICATIONS_DLQ,
  EmailNotificationJobData,
  emailNotificationDLQ,
} from './queue';
import { prisma } from '../config/prisma';

/**
 * Mock Email Service with structured terminal / audit output
 */
export const sendMockEmail = async (jobData: EmailNotificationJobData) => {
  const emailContent = {
    to: `${jobData.userName} <${jobData.userEmail}>`,
    subject: `🔔 Task Assigned: ${jobData.taskTitle}`,
    preview: `You have been assigned to task "${jobData.taskTitle}" in project workspace "${jobData.orgName}" by ${jobData.assignedByUserName}.`,
    sentAt: new Date().toISOString(),
  };

  // Simulate simulated network failure for specific test simulation if payload says forceFail
  if ((jobData as any).forceFail) {
    throw new Error('Simulated SMTP Mail Delivery Failure');
  }

  // Artificial network latency simulation (50ms)
  await new Promise((resolve) => setTimeout(resolve, 50));

  console.log('----------------------------------------------------');
  console.log('📧 [EMAIL NOTIFICATION DISPATCHED]');
  console.log(`   To:       ${emailContent.to}`);
  console.log(`   Subject:  ${emailContent.subject}`);
  console.log(`   Message:  ${emailContent.preview}`);
  console.log(`   Sent At:  ${emailContent.sentAt}`);
  console.log('----------------------------------------------------');

  return {
    delivered: true,
    recipient: jobData.userEmail,
    timestamp: emailContent.sentAt,
  };
};

/**
 * Initialize BullMQ Background Worker
 */
export const createEmailNotificationWorker = () => {
  const worker = new Worker<EmailNotificationJobData>(
    EMAIL_NOTIFICATIONS_QUEUE,
    async (job: Job<EmailNotificationJobData>) => {
      console.log(`\n⚙️ [WORKER] Processing Job ID: ${job.id} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts})`);

      const result = await sendMockEmail(job.data);

      // Update outbox job in database if present
      await prisma.outboxJob.updateMany({
        where: {
          jobType: 'task-assignment-notification',
          payload: {
            path: ['taskId'],
            equals: job.data.taskId,
          },
          status: 'pending',
        },
        data: {
          status: 'dispatched',
          processedAt: new Date(),
        },
      });

      return result;
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5,
      // Bonus: Global rate limiter — 50 emails per minute
      limiter: {
        max: 50,
        duration: 60000,
      },
    }
  );

  // Worker Event Listeners
  worker.on('completed', (job: Job) => {
    console.log(`✅ [WORKER] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', async (job: Job | undefined, err: Error) => {
    if (!job) {
      console.error('❌ [WORKER] Job failure without job context:', err.message);
      return;
    }

    console.error(`⚠️ [WORKER] Job ${job.id} failed on attempt ${job.attemptsMade}/${job.opts.attempts}. Error: ${err.message}`);

    // If all retry attempts are exhausted, move job to Dead-Letter Queue (DLQ)
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      console.error(`🚨 [WORKER DLQ] Retries exhausted for Job ${job.id}. Moving to Dead-Letter Queue: ${EMAIL_NOTIFICATIONS_DLQ}`);
      try {
        await emailNotificationDLQ.add(
          'failed-task-assignment-notification',
          job.data,
          {
            jobId: `dlq_${job.id}`,
            removeOnComplete: false,
          }
        );

        // Update Outbox job as failed in DB
        await prisma.outboxJob.updateMany({
          where: {
            payload: {
              path: ['taskId'],
              equals: job.data.taskId,
            },
          },
          data: {
            status: 'failed',
            error: err.message,
            processedAt: new Date(),
          },
        });

        console.log(`📦 [WORKER DLQ] Successfully persisted failed job ${job.id} into DLQ.`);
      } catch (dlqError: any) {
        console.error(`💥 [WORKER DLQ ERROR] Failed to push to DLQ:`, dlqError.message);
      }
    }
  });

  worker.on('error', (err: Error) => {
    console.error('❌ [WORKER ERROR]', err);
  });

  return worker;
};
