/** Claims carried by the access token. Kept minimal on purpose. */
export interface AccessTokenPayload {
  /** User id (JWT `sub` is always a string). */
  sub: string;
  /** Refresh-token family id of the login session that issued this token. */
  sid: string;
}

/** Identity attached to `request.user` after the access token is verified. */
export interface AuthenticatedUser {
  userId: number;
  sessionId: string;
}
