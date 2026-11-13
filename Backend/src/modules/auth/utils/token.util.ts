import { createHash, randomBytes } from 'node:crypto';
import { REFRESH_TOKEN_BYTES } from '../../../common/constants/auth.constants.js';

/** Cryptographically secure, URL-safe opaque refresh token (256 bits of entropy). */
export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

/**
 * SHA-256 hex digest used to store and look up refresh tokens.
 * A fast hash is appropriate because the input is 256-bit random data that cannot be
 * brute-forced, and a deterministic digest allows an indexed lookup.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
