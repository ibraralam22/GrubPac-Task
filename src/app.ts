import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';

import { authRouter } from './modules/auth/auth.routes';
import { projectsRouter } from './modules/projects/projects.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { commentsRouter } from './modules/comments/comments.routes';
import { jobsRouter } from './modules/jobs/jobs.routes';

export const createApp = (): Express => {
  const app: Express = express();

  // Security headers & CORS
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI assets to load without CSP interference
    })
  );
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

  // OpenAPI Swagger UI Documentation
  try {
    const swaggerDocPath = path.join(process.cwd(), 'docs/openapi.yaml');
    const swaggerDocument = YAML.load(swaggerDocPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    console.warn('⚠️ Could not load OpenAPI specification for Swagger UI:', err);
  }

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

  // API Routes
  app.use('/auth', authRouter);
  app.use('/projects', projectsRouter);
  app.use('/tasks', tasksRouter);
  app.use('/tasks/:taskId/comments', commentsRouter);
  app.use('/jobs', jobsRouter);

  return app;
};
