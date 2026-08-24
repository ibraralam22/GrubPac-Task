import { Queue, JobsOptions } from 'bullmq';
import { redisConnectionOptions } from './redis';
import { prisma } from '../config/prisma';

export const EMAIL_NOTIFICATIONS_QUEUE = 'email-notifications';
export const EMAIL_NOTIFICATIONS_DLQ = 'email-notifications-dlq';

export interface EmailNotificationJobData {
  taskId: string;
  taskTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  orgId: string;
  orgName: string;
  assignedAt: string;
}

// Main Email Notification Queue
export const emailNotificationQueue = new Queue<EmailNotificationJobData>(EMAIL_NOTIFICATIONS_QUEUE, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s -> 2s -> 4s
    },
    removeOnComplete: {
      count: 1000,
    },
    removeOnFail: false, // Keep in queue for status inspection & DLQ tracking
  },
});

// Dead-Letter Queue (DLQ)
export const emailNotificationDLQ = new Queue<EmailNotificationJobData>(EMAIL_NOTIFICATIONS_DLQ, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false,
  },
});

/**
 * Enqueues an email notification for a task assignment with outbox consistency and 5-second deduplication
 */
export const enqueueAssignmentNotification = async (data: EmailNotificationJobData) => {
  // Bonus: Deduplicate assignments within 5-second window using windowed timestamp in jobId
  const fiveSecondWindow = Math.floor(Date.now() / 5000);
  const jobId = `assignment_${data.taskId}_${data.userId}_${fiveSecondWindow}`;

  const jobOptions: JobsOptions = {
    jobId,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s -> 2s -> 4s
    },
  };

  try {
    const job = await emailNotificationQueue.add('task-assignment-notification', data, jobOptions);
    return { jobId: job.id || jobId, enqueued: true };
  } catch (error: any) {
    console.error('⚠️ Failed to directly enqueue to Redis. Outbox fallback active:', error.message);
    return { jobId, enqueued: false, error: error.message };
  }
};

/**
 * Fetch status and metadata for a job by ID
 */
export const getJobStatusById = async (jobId: string) => {
  // Check main queue first
  let job = await emailNotificationQueue.getJob(jobId);
  let inDLQ = false;

  if (!job) {
    // Check DLQ
    job = await emailNotificationDLQ.getJob(jobId);
    if (job) {
      inDLQ = true;
    }
  }

  if (!job) {
    return null;
  }

  const state = await job.getState();
  
  // Normalize status to one of: 'pending', 'active', 'completed', 'failed'
  let normalizedStatus: 'pending' | 'active' | 'completed' | 'failed' = 'pending';
  if (state === 'active') {
    normalizedStatus = 'active';
  } else if (state === 'completed') {
    normalizedStatus = 'completed';
  } else if (state === 'failed' || inDLQ) {
    normalizedStatus = 'failed';
  } else {
    normalizedStatus = 'pending'; // 'waiting', 'delayed', 'prioritized' map to 'pending'
  }

  return {
    jobId: job.id,
    name: job.name,
    status: normalizedStatus,
    rawState: state,
    inDLQ,
    data: job.data,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason || null,
    stacktrace: job.stacktrace,
    returnvalue: job.returnvalue || null,
    timestamp: job.timestamp ? new Date(job.timestamp).toISOString() : null,
    processedOn: job.processedOn ? new Date(job.processedOn).toISOString() : null,
    finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
  };
};
