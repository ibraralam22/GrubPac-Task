import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './errors/AppError';
import { faviconHandler } from './views/favicon';
import { getDetailedHealthReport } from './services/healthService';
import { renderHealthHtml } from './views/healthView';
import { renderDashboardHtml } from './views/dashboardView';
import { customSwaggerOptions } from './views/swaggerTheme';

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
      contentSecurityPolicy: false, // Allows Swagger UI and dashboard assets to load smoothly
    })
  );
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
    })
  );

  // Favicon & Vector Brand Assets (prevents 404s)
  app.get(['/favicon.ico', '/favicon.svg', '/logo.svg'], faviconHandler);

  // Request parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(requestLogger);

  // Static OpenAPI Spec endpoint
  app.get('/docs/openapi.yaml', (_req: Request, res: Response) => {
    const yamlPath = path.join(process.cwd(), 'docs/openapi.yaml');
    if (fs.existsSync(yamlPath)) {
      res.setHeader('Content-Type', 'text/yaml');
      res.sendFile(yamlPath);
    } else {
      res.status(404).json({ error: 'OpenAPI specification file not found' });
    }
  });

  // OpenAPI Swagger UI Documentation with custom dark modern theme
  try {
    const swaggerDocPath = path.join(process.cwd(), 'docs/openapi.yaml');
    const swaggerDocument = YAML.load(swaggerDocPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, customSwaggerOptions));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, customSwaggerOptions));
  } catch (err) {
    console.warn('⚠️ Could not load OpenAPI specification for Swagger UI:', err);
  }

  // Health check endpoint (dual-mode: HTML for browser, JSON for API/curl)
  app.get('/health', async (req: Request, res: Response) => {
    const report = await getDetailedHealthReport();
    
    // Check if client explicitly requests HTML (e.g. web browser)
    if (req.accepts(['html', 'json']) === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.status(report.status === 'down' ? 503 : 200).send(renderHealthHtml(report));
    }

    // Programmatic JSON response for monitoring/API callers
    return res.status(report.status === 'down' ? 503 : 200).json({
      status: report.status === 'healthy' ? 'ok' : report.status,
      service: report.service,
      version: report.version,
      timestamp: report.timestamp,
      uptime: report.uptime.seconds,
      uptimeFormatted: report.uptime.formatted,
      environment: report.environment,
      system: report.system,
      services: report.services,
    });
  });

  // Base API route / Developer Console (dual-mode: HTML for browser, JSON for API)
  app.get('/', async (req: Request, res: Response) => {
    const report = await getDetailedHealthReport();

    if (req.accepts(['html', 'json']) === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(renderDashboardHtml(report));
    }

    return res.status(200).json({
      name: 'TaskFlow API',
      version: '1.0.0',
      description: 'Multi-Tenant Project Management & Queue Backend',
      docs: '/docs',
      health: '/health',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: '/auth',
        projects: '/projects',
        tasks: '/tasks',
        comments: '/tasks/:taskId/comments',
        jobs: '/jobs',
      },
    });
  });

  // API Routes
  app.use('/auth', authRouter);
  app.use('/projects', projectsRouter);
  app.use('/tasks', tasksRouter);
  app.use('/tasks/:taskId/comments', commentsRouter);
  app.use('/jobs', jobsRouter);

  // Fallback 404 handler for unknown routes
  app.use((req: Request, res: Response, next) => {
    if (req.accepts(['html', 'json']) === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found • TaskFlow API</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
    }
    .card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .code { font-size: 3.5rem; font-weight: 800; color: #818cf8; margin-bottom: 0.5rem; }
    h1 { font-size: 1.3rem; margin-bottom: 0.75rem; }
    p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .route-badge { background: #060911; padding: 0.4rem 0.8rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #38bdf8; display: inline-block; margin-bottom: 1.5rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; }
    .btn { background: #6366f1; color: #fff; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; }
    .btn-alt { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">404</div>
    <h1>Endpoint Not Found</h1>
    <p>The requested endpoint does not exist or has moved.</p>
    <div class="route-badge">${req.method} ${req.originalUrl}</div>
    <div class="actions">
      <a href="/" class="btn">🚀 Developer Portal</a>
      <a href="/docs" class="btn btn-alt">📖 Swagger UI</a>
    </div>
  </div>
</body>
</html>`);
    }

    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
};
