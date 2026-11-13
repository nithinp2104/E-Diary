import { isAxiosError, type AxiosInstance } from 'axios';

import { tokenManager } from './token-manager';

const AUTHORIZATION = 'Authorization';
let installed = false;

const bearer = (token: string) => `Bearer ${token}`;

/**
 * Attaches the in-memory access token to outgoing requests and transparently
 * refreshes it once when the backend answers 401. Safe to call more than once.
 */
export function installAuthInterceptors(client: AxiosInstance): void {
  if (installed) return;
  installed = true;

  client.interceptors.request.use((config) => {
    const token = tokenManager.getAccessToken();
    if (!config.skipAuth && token) {
      config.headers.set(AUTHORIZATION, bearer(token));
    }
    return config;
  });

  client.interceptors.response.use(undefined, async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) return Promise.reject(error);

    const config = error.config;
    if (error.response?.status !== 401 || config.skipAuth || config._retried) {
      return Promise.reject(error);
    }
    config._retried = true;

    // Another request may already have refreshed while this one was in flight.
    const sentWith = config.headers.get(AUTHORIZATION);
    const current = tokenManager.getAccessToken();
    const token =
      current && sentWith !== bearer(current) ? current : await tokenManager.refreshAccessToken();

    config.headers.set(AUTHORIZATION, bearer(token));
    return client(config);
  });
}
