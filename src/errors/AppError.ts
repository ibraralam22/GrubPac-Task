export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, any>;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details: Record<string, any> = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code: string = 'BAD_REQUEST', details: Record<string, any> = {}) {
    super(message, 400, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'RESOURCE_NOT_FOUND', details: Record<string, any> = {}) {
    super(message, 404, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'UNAUTHORIZED', details: Record<string, any> = {}) {
    super(message, 401, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied to this resource', code: string = 'FORBIDDEN', details: Record<string, any> = {}) {
    super(message, 403, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT', details: Record<string, any> = {}) {
    super(message, 409, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation error', details: Record<string, any> = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
