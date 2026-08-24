import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './errors/AppError';

export const createApp = (): Express => {
  const app: Express = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
    })
  );

  // Request parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'taskflow-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Base API route
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'TaskFlow API',
      version: '1.0.0',
      docs: '/docs',
      health: '/health',
    });
  });

  // Handle 404 for unmapped routes (registered before error handler, but will be placed after route mounts later)
  // We will attach dynamic routes in subsequent phases!

  return app;
};
