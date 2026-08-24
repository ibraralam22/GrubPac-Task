import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Hash password using bcrypt with cost factor >= 12
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = Math.max(env.BCRYPT_SALT_ROUNDS, 12);
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain password against stored bcrypt hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
