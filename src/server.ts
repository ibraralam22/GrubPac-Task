import { createApp } from './app';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './errors/AppError';

const app = createApp();

// Fallback 404 handler for unknown routes
app.use((req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
});

// Centralized error handler
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`🚀 TaskFlow API Server running at http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`🩺 Health check accessible at http://localhost:${env.PORT}/health`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server };
