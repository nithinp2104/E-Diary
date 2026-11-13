import { apiClient } from '@/lib/api/client';
import { unwrapData } from '@/lib/api/errors';
import type { ApiSuccessResponse } from '@/lib/api/types';

import { AUTH_ENDPOINTS } from '../constants';
import type { AuthTokens, LoginRequest, RegisterRequest, UserProfile } from '../types/auth.types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUserProfile(value: unknown): value is UserProfile {
  return (
    isObject(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.isActive === 'boolean'
  );
}

function isAuthTokens(value: unknown): value is AuthTokens {
  return (
    isObject(value) &&
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    typeof value.refreshToken === 'string' &&
    value.refreshToken.length > 0 &&
    typeof value.expiresIn === 'number'
  );
}

/** Thin wrappers around the backend auth endpoints. No state lives here. */
export const authApi = {
  async register(payload: RegisterRequest): Promise<UserProfile> {
    const { data } = await apiClient.post<ApiSuccessResponse<UserProfile>>(AUTH_ENDPOINTS.register, payload, {
      skipAuth: true,
    });
    return unwrapData(data, isUserProfile);
  },

  async login(payload: LoginRequest): Promise<AuthTokens> {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthTokens>>(AUTH_ENDPOINTS.login, payload, {
      skipAuth: true,
    });
    return unwrapData(data, isAuthTokens);
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      AUTH_ENDPOINTS.refresh,
      { refreshToken },
      { skipAuth: true },
    );
    return unwrapData(data, isAuthTokens);
  },

  /** Revokes the server session that issued the current access token. */
  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.logout);
  },

  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiSuccessResponse<UserProfile>>(AUTH_ENDPOINTS.me);
    return unwrapData(data, isUserProfile);
  },
};
