import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { apiClient } from '@/lib/api/client';
import { toApiError } from '@/lib/api/errors';

import { authApi } from '../api/auth.api';
import { installAuthInterceptors } from '../session/auth-interceptors';
import { tokenManager } from '../session/token-manager';
import type {
  AuthNotice,
  AuthStatus,
  LoginRequest,
  RegisterRequest,
  SubscriptionStatus,
  UserProfile,
} from '../types/auth.types';
import { resolveSubscriptionStatus } from '../utils/subscription';

installAuthInterceptors(apiClient);

export interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  subscriptionStatus: SubscriptionStatus;
  isInitializing: boolean;
  isAuthenticated: boolean;
  /** Session-level message for the auth screens (expired session, restore failure). */
  notice: AuthNotice | null;
  login: (credentials: LoginRequest) => Promise<void>;
  /** Creates the account only. The backend issues no tokens on registration. */
  register: (payload: RegisterRequest) => Promise<UserProfile>;
  logout: () => Promise<void>;
  /** Restores the persisted session (refresh token -> new tokens -> profile). */
  restoreSession: () => Promise<void>;
  /** Re-fetches the profile, e.g. to re-check subscription status. */
  refreshUser: () => Promise<void>;
  clearNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
  notice: AuthNotice | null;
}

const SIGNED_OUT: AuthState = { status: 'unauthenticated', user: null, notice: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'initializing', user: null, notice: null });
  const isLoggingOut = useRef(false);
  const hasRestored = useRef(false);

  // The server rejected our refresh token (expired, revoked, reused): drop to signed-out.
  useEffect(
    () =>
      tokenManager.onSessionExpired(() => {
        setState(
          isLoggingOut.current ? SIGNED_OUT : { ...SIGNED_OUT, notice: { type: 'session-expired' } },
        );
      }),
    [],
  );

  const restoreSession = useCallback(async () => {
    setState((current) => ({ ...current, status: 'initializing' }));
    try {
      if (!(await tokenManager.hasStoredSession())) {
        setState(SIGNED_OUT);
        return;
      }
      await tokenManager.refreshAccessToken();
      const user = await authApi.getProfile();
      setState({ status: 'authenticated', user, notice: null });
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.isConnectivityIssue || apiError.kind === 'server' || apiError.kind === 'rate_limited') {
        // Keep the stored refresh token: the session may still be valid once we are back online.
        setState({ ...SIGNED_OUT, notice: { type: 'restore-failed', message: apiError.message } });
        return;
      }
      await tokenManager.clearSession();
      setState((current) => (current.notice ? { ...SIGNED_OUT, notice: current.notice } : SIGNED_OUT));
    }
  }, []);

  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const tokens = await authApi.login(credentials);
    await tokenManager.startSession(tokens);
    try {
      const user = await authApi.getProfile();
      setState({ status: 'authenticated', user, notice: null });
    } catch (error) {
      await tokenManager.clearSession();
      throw error;
    }
  }, []);

  const register = useCallback((payload: RegisterRequest) => authApi.register(payload), []);

  const logout = useCallback(async () => {
    isLoggingOut.current = true;
    try {
      if (tokenManager.getAccessToken()) {
        // Best effort: revoke the server session; local sign-out happens regardless.
        await authApi.logout();
      }
    } catch {
      // Offline or already revoked: nothing else to do.
    } finally {
      await tokenManager.clearSession();
      isLoggingOut.current = false;
      setState(SIGNED_OUT);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await authApi.getProfile();
    setState((current) => (current.status === 'authenticated' ? { ...current, user } : current));
  }, []);

  const clearNotice = useCallback(() => {
    setState((current) => (current.notice ? { ...current, notice: null } : current));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      user: state.user,
      subscriptionStatus: resolveSubscriptionStatus(state.user),
      isInitializing: state.status === 'initializing',
      isAuthenticated: state.status === 'authenticated',
      notice: state.notice,
      login,
      register,
      logout,
      restoreSession,
      refreshUser,
      clearNotice,
    }),
    [state, login, register, logout, restoreSession, refreshUser, clearNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
