import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.') || 'body';
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(e.message);
    });

    res.status(400).json({
      error: 'Validation failed for request data',
      code: 'VALIDATION_ERROR',
      details: formattedErrors,
    });
    return;
  }

  // Log unhandled server errors in dev/prod
  console.error('💥 Unhandled Exception:', err);

  const response: { error: string; code: string; details: Record<string, any>; stack?: string } = {
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    details: {},
  };

  if (env.NODE_ENV === 'development') {
    response.details = { rawMessage: err.message };
    response.stack = err.stack;
  }

  res.status(500).json(response);
};
