import { prisma } from '../config/prisma';
import { redisClient } from '../jobs/redis';
import { emailNotificationQueue } from '../jobs/queue';
import { env } from '../config/env';

export interface ServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface DetailedHealthReport {
  status: 'healthy' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    pid: number;
    memory: {
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
      externalMB: number;
    };
  };
  services: {
    database: ServiceHealthStatus;
    redis: ServiceHealthStatus;
    queues: ServiceHealthStatus;
  };
}

/**
 * Format uptime seconds into human-readable string (e.g., "2d 4h 12m 30s")
 */
export const formatUptime = (totalSeconds: number): string => {
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

/**
 * Perform deep diagnostic checks on all external dependencies and subsystems
 */
export const getDetailedHealthReport = async (): Promise<DetailedHealthReport> => {
  const startTime = Date.now();

  // 1. Check PostgreSQL via Prisma
  let databaseHealth: ServiceHealthStatus = { status: 'down' };
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    databaseHealth = {
      status: 'healthy',
      latencyMs: Math.max(1, dbLatency),
      details: { dialect: 'PostgreSQL' },
    };
  } catch (err: any) {
    databaseHealth = {
      status: 'down',
      message: err?.message || 'Database ping failed',
    };
  }

  // 2. Check Redis
  let redisHealth: ServiceHealthStatus = { status: 'down' };
  try {
    const redisStart = Date.now();
    const pong = await redisClient.ping();
    const redisLatency = Date.now() - redisStart;
    if (pong === 'PONG') {
      redisHealth = {
        status: 'healthy',
        latencyMs: Math.max(1, redisLatency),
        details: { host: env.REDIS_HOST, port: env.REDIS_PORT },
      };
    } else {
      redisHealth = {
        status: 'degraded',
        message: `Unexpected Redis ping response: ${pong}`,
      };
    }
  } catch (err: any) {
    redisHealth = {
      status: 'down',
      message: err?.message || 'Redis connection failed',
    };
  }

  // 3. Check BullMQ Queues
  let queuesHealth: ServiceHealthStatus = { status: 'down' };
  try {
    const isPaused = await emailNotificationQueue.isPaused();
    const waitingCount = await emailNotificationQueue.getWaitingCount().catch(() => 0);
    const activeCount = await emailNotificationQueue.getActiveCount().catch(() => 0);
    const failedCount = await emailNotificationQueue.getFailedCount().catch(() => 0);

    queuesHealth = {
      status: isPaused ? 'degraded' : 'healthy',
      details: {
        queue: 'email-notifications',
        isPaused,
        waitingJobs: waitingCount,
        activeJobs: activeCount,
        failedJobs: failedCount,
      },
    };
  } catch (err: any) {
    queuesHealth = {
      status: 'down',
      message: err?.message || 'Queue status check failed',
    };
  }

  // Overall system status
  let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
  if (databaseHealth.status === 'down' || redisHealth.status === 'down') {
    overallStatus = 'down';
  } else if (databaseHealth.status === 'degraded' || redisHealth.status === 'degraded' || queuesHealth.status === 'degraded') {
    overallStatus = 'degraded';
  }

  const mem = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  return {
    status: overallStatus,
    service: 'taskflow-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: {
      seconds: Math.round(uptimeSeconds),
      formatted: formatUptime(uptimeSeconds),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      memory: {
        heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
        heapTotalMB: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
        rssMB: Number((mem.rss / 1024 / 1024).toFixed(2)),
        externalMB: Number((mem.external / 1024 / 1024).toFixed(2)),
      },
    },
    services: {
      database: databaseHealth,
      redis: redisHealth,
      queues: queuesHealth,
    },
  };
};
