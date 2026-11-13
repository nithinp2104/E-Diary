import { argon2id, type HashOptions } from 'argon2';

export const JWT_STRATEGY = 'jwt';
export const JWT_ALGORITHM = 'HS256';
export const BEARER_AUTH_NAME = 'access-token';

/** Argon2id parameters (64 MiB memory, 3 passes, 4 lanes), above the OWASP minimum. */
export const ARGON2_OPTIONS: HashOptions = {
  type: argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/** 256 bits of entropy for opaque refresh tokens. */
export const REFRESH_TOKEN_BYTES = 32;

export const PASSWORD_MIN_LENGTH = 8;
/** Upper bound prevents hashing pathologically large inputs. */
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

const ONE_MINUTE_MS = 60_000;

/** Per-IP rate limits. `default` applies to every route; the others tighten sensitive auth routes. */
export const RATE_LIMITS = {
  default: { ttl: ONE_MINUTE_MS, limit: 100 },
  login: { ttl: ONE_MINUTE_MS, limit: 5 },
  register: { ttl: ONE_MINUTE_MS * 60, limit: 10 },
  refresh: { ttl: ONE_MINUTE_MS, limit: 20 },
} as const;

export const AUTH_MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  accountDisabled: 'Account is disabled',
  emailTaken: 'An account with this email already exists',
  invalidRefreshToken: 'Invalid or expired refresh token',
  sessionNotFound: 'Session is no longer valid',
} as const;
