/**
 * Why a refresh session stopped being usable. ROTATED rows are kept so that replaying an
 * already-rotated token can be detected as reuse.
 */
export enum SessionRevocationReason {
  ROTATED = 'ROTATED',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  REUSE_DETECTED = 'REUSE_DETECTED',
  USER_INACTIVE = 'USER_INACTIVE',
}
