import { ApiError, toApiError } from '@/lib/api/errors';
import { secureStorage } from '@/lib/storage/secure-storage';

import { authApi } from '../api/auth.api';
import { REFRESH_TOKEN_STORAGE_KEY } from '../constants';
import type { AuthTokens } from '../types/auth.types';

/**
 * Owns the token lifecycle:
 * - the short-lived access token lives only in memory;
 * - the rotating refresh token is persisted in SecureStore;
 * - refreshes are single-flight, because the backend treats a reused refresh token
 *   as theft and revokes the entire session.
 *
 * Tokens are never logged.
 */
let accessToken: string | null = null;
let refreshInFlight: Promise<string> | null = null;
const expiredListeners = new Set<() => void>();

async function expireSession(): Promise<void> {
  accessToken = null;
  await secureStorage.deleteItem(REFRESH_TOKEN_STORAGE_KEY);
  expiredListeners.forEach((listener) => listener());
}

async function performRefresh(): Promise<string> {
  const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) {
    await expireSession();
    throw new ApiError('unauthorized', 'Your session has expired. Please sign in again.', 401);
  }

  try {
    const tokens = await authApi.refresh(refreshToken);
    // Persist the rotated token first: the old one is already invalid on the server.
    await secureStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    accessToken = tokens.accessToken;
    return tokens.accessToken;
  } catch (error) {
    const apiError = toApiError(error);
    // Only a definitive rejection ends the session. Network failures keep the
    // refresh token so the user is not logged out by a flaky connection.
    if (apiError.kind === 'unauthorized' || apiError.kind === 'validation' || apiError.kind === 'forbidden') {
      await expireSession();
    }
    throw apiError;
  }
}

export const tokenManager = {
  getAccessToken(): string | null {
    return accessToken;
  },

  async hasStoredSession(): Promise<boolean> {
    return (await secureStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)) !== null;
  },

  async startSession(tokens: AuthTokens): Promise<void> {
    await secureStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    accessToken = tokens.accessToken;
  },

  /** Clears local credentials without notifying listeners (used by explicit logout). */
  async clearSession(): Promise<void> {
    accessToken = null;
    await secureStorage.deleteItem(REFRESH_TOKEN_STORAGE_KEY);
  },

  /** Returns a fresh access token. Concurrent callers share one refresh request. */
  refreshAccessToken(): Promise<string> {
    refreshInFlight ??= performRefresh().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  },

  /** Fires when the server rejects the refresh token and the session is gone. */
  onSessionExpired(listener: () => void): () => void {
    expiredListeners.add(listener);
    return () => {
      expiredListeners.delete(listener);
    };
  },
};
