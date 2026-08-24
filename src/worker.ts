import { createEmailNotificationWorker } from './jobs/worker';
import { env } from './config/env';

console.log('====================================================');
console.log(`🤖 TaskFlow Background Worker Process Started`);
console.log(`🌍 Environment: ${env.NODE_ENV}`);
console.log(`⚡ Redis: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
console.log(`🔄 Retry Policy: 3 attempts with exponential backoff (1s -> 2s -> 4s)`);
console.log(`🛡️ DLQ Queue: email-notifications-dlq`);
console.log(`⏱️ Rate Limiter: 50 emails / minute`);
console.log('====================================================');

const worker = createEmailNotificationWorker();

const shutdown = async (signal: string) => {
  console.log(`\n🛑 Worker received ${signal}. Closing gracefully...`);
  await worker.close();
  console.log('✅ Worker closed successfully.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
