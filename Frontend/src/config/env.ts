/**
 * Public runtime configuration.
 *
 * Only `EXPO_PUBLIC_*` variables are available here and they are inlined into the
 * JavaScript bundle, so they are visible to anyone who has the app. Never put
 * secrets (API keys, JWT secrets, database credentials) in them.
 *
 * `process.env.EXPO_PUBLIC_*` must be referenced statically (no destructuring or
 * dynamic keys), otherwise Expo cannot inline the value.
 */

function resolveApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!raw) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set the backend URL.',
    );
  }

  const match = /^(https?):\/\/[^\s/?#]+/i.exec(raw);
  if (!match) {
    throw new Error('EXPO_PUBLIC_API_URL must be an absolute http(s) URL.');
  }

  // Credentials and tokens must never travel over plain HTTP outside local development.
  if (!__DEV__ && match[1].toLowerCase() !== 'https') {
    throw new Error('EXPO_PUBLIC_API_URL must use https:// in production builds.');
  }

  return raw.replace(/\/+$/, '');
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  apiTimeoutMs: 15_000,
} as const;
