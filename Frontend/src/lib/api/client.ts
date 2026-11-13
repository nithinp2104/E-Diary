import { create } from 'axios';

import { env } from '@/config/env';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Do not attach the access token and never attempt a token refresh for this request. */
    skipAuth?: boolean;
    /** Internal: marks a request that has already been retried after a token refresh. */
    _retried?: boolean;
  }
}

/**
 * The single HTTP client for the app. Auth interceptors are attached by
 * `features/auth/session/auth-interceptors.ts`.
 *
 * The backend CORS policy only allows `Authorization` and `Content-Type`
 * request headers, so do not add custom headers here.
 */
export const apiClient = create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});
