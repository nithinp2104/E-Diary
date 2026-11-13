/** Field limits mirrored from backend `common/constants/auth.constants.ts`. */
export const AUTH_LIMITS = {
  nameMaxLength: 100,
  emailMaxLength: 254,
  passwordMinLength: 8,
  passwordMaxLength: 128,
} as const;

export const AUTH_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
} as const;

export const REFRESH_TOKEN_STORAGE_KEY = 'ediary.auth.refreshToken';
