import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../src/utils/password';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
} from '../../src/utils/token';
import { UnauthorizedError } from '../../src/errors/AppError';

describe('Unit Tests: Authentication & Hashing Logic', () => {
  it('should hash password using bcrypt with cost factor >= 12', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    // bcrypt hash format: $2a$12$... or $2b$12$...
    const rounds = parseInt(hash.split('$')[2], 10);
    expect(rounds).toBeGreaterThanOrEqual(12);

    const isValid = await comparePassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isWrong = await comparePassword('WrongPassword', hash);
    expect(isWrong).toBe(false);
  });

  it('should generate and verify valid JWT access tokens', () => {
    const payload = {
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'tester@acme.com',
      orgId: '22222222-2222-2222-2222-222222222222',
      role: 'org_admin' as const,
    };

    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.orgId).toBe(payload.orgId);
    expect(decoded.role).toBe(payload.role);
  });

  it('should throw UnauthorizedError when verifying an invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.signature')).toThrowError(UnauthorizedError);
  });

  it('should generate secure opaque refresh tokens and SHA-256 hashes', () => {
    const { token, tokenHash, expiresAt } = generateRefreshToken();

    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(32);
    expect(tokenHash).toBe(hashToken(token));

    // Expiration date should be ~7 days in the future
    const now = Date.now();
    const diffDays = (expiresAt.getTime() - now) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
  });
});
