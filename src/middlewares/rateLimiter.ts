import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Rate limiter middleware for authentication endpoints: 10 requests / minute / IP
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 60 * 1000, // 1 minute
  max: env.RATE_LIMIT_MAX_AUTH || 10, // 10 requests per window
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    error: 'Too many authentication attempts. Please try again after 1 minute.',
    code: 'RATE_LIMIT_EXCEEDED',
    details: {
      retryAfterSeconds: 60,
    },
  },
  handler: (_req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});
