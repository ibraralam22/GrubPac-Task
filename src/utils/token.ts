import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors/AppError';

export interface JwtAccessTokenPayload {
  userId: string;
  email: string;
  orgId: string;
  role: 'org_admin' | 'member';
}

/**
 * Generate short-lived JWT access token (15m TTL)
 */
export const generateAccessToken = (payload: JwtAccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Verify JWT access token and return decoded payload
 */
export const verifyAccessToken = (token: string): JwtAccessTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessTokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Invalid access token', 'TOKEN_INVALID');
  }
};

/**
 * Generate secure random opaque refresh token and compute its SHA-256 hash for database storage
 */
export const generateRefreshToken = () => {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(token);
  // 7 days expiration date
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
};

/**
 * Compute SHA-256 hash of a refresh token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
