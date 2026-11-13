import type { SubscriptionStatus, UserProfile } from '../types/auth.types';

/**
 * Derives subscription status from the server-provided profile only.
 * The result is held in memory and is never persisted, so a local flag can
 * never grant access. The backend remains the authority on protected data.
 *
 * NOTE: The current backend `UserProfileDto` (GET /auth/me) exposes no
 * subscription information, so this always resolves to `unknown`, which does
 * not grant access. Once the backend returns subscription data, map it here.
 */
export function resolveSubscriptionStatus(_user: UserProfile | null): SubscriptionStatus {
  return 'unknown';
}
