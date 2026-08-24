import supertest from 'supertest';
import { createApp } from '../src/app';
import { errorHandler } from '../src/middlewares/errorHandler';
import { NotFoundError } from '../src/errors/AppError';

export const getTestApp = () => {
  const app = createApp();
  app.use((req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
  });
  app.use(errorHandler);
  return app;
};

export const request = supertest(getTestApp());
