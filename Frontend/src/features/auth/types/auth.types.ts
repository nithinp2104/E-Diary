/** Mirrors backend `RegisterDto` (POST /auth/register). The backend rejects any other property. */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Mirrors backend `LoginDto` (POST /auth/login). */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors backend `UserProfileDto`. Dates arrive as ISO-8601 strings. */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors backend `AuthTokensDto` (login and refresh). */
export interface AuthTokens {
  accessToken: string;
  /** Opaque and single-use: every refresh returns a new one (rotation). */
  refreshToken: string;
  tokenType: 'Bearer';
  /** Access-token lifetime in seconds. */
  expiresIn: number;
  /** Refresh-token lifetime in seconds. */
  refreshTokenExpiresIn: number;
}

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

/**
 * `unknown` means the backend did not tell us; it must never grant access.
 */
export type SubscriptionStatus = 'active' | 'expired' | 'unknown';

export type AuthNotice =
  | { type: 'session-expired' }
  | { type: 'restore-failed'; message: string };
