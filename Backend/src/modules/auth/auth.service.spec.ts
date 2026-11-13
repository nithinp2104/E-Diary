import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'argon2';
import { ARGON2_OPTIONS } from '../../common/constants/auth.constants.js';
import type { AppConfigService } from '../../config/app-config.service.js';
import { SessionRevocationReason } from './enums/session-revocation-reason.enum.js';
import { AuthService } from './auth.service.js';
import type { PublicUser, UsersRepository } from '../users/repositories/users.repository.js';
import type {
  RefreshSessionLookup,
  RefreshSessionRepository,
} from './repositories/refresh-session.repository.js';
import { hashRefreshToken } from './utils/token.util.js';

const ACCESS_SECRET = 'test-secret-that-is-at-least-32-characters-long';

const publicUser: PublicUser = {
  id: 7,
  name: 'Jane',
  email: 'jane@example.com',
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function activeSession(overrides: Partial<RefreshSessionLookup> = {}): RefreshSessionLookup {
  return {
    id: 1,
    userId: publicUser.id,
    familyId: '6f1c3c2e-6c55-4a3e-9d0b-1f9f6b2c1a11',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    revokedReason: null,
    user: { isActive: true },
    ...overrides,
  };
}

describe('AuthService', () => {
  const usersRepository = {
    findUserByEmail: vi.fn<UsersRepository['findUserByEmail']>(),
    findUserById: vi.fn<UsersRepository['findUserById']>(),
    createUser: vi.fn<UsersRepository['createUser']>(),
  };
  const sessionRepository = {
    createSession: vi.fn<RefreshSessionRepository['createSession']>(),
    findSessionByTokenHash: vi.fn<RefreshSessionRepository['findSessionByTokenHash']>(),
    rotateSession: vi.fn<RefreshSessionRepository['rotateSession']>(),
    revokeSessionFamily: vi.fn<RefreshSessionRepository['revokeSessionFamily']>(),
    revokeSession: vi.fn<RefreshSessionRepository['revokeSession']>(),
    revokeAllUserSessions: vi.fn<RefreshSessionRepository['revokeAllUserSessions']>(),
  };
  const jwtService = new JwtService({
    secret: ACCESS_SECRET,
    signOptions: { algorithm: 'HS256', expiresIn: 900 },
  });
  const config = {
    jwt: { accessSecret: ACCESS_SECRET, accessExpiresInSeconds: 900, refreshExpiresInSeconds: 3600 },
  } as AppConfigService;

  let service: AuthService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new AuthService(
      usersRepository as unknown as UsersRepository,
      sessionRepository as unknown as RefreshSessionRepository,
      jwtService,
      config,
    );
  });

  describe('register', () => {
    it('stores an argon2id hash, never the plaintext password', async () => {
      usersRepository.findUserByEmail.mockResolvedValue(null);
      usersRepository.createUser.mockResolvedValue(publicUser);

      const result = await service.register({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
      });

      const stored = usersRepository.createUser.mock.calls[0][0];
      expect(stored.passwordHash).toMatch(/^\$argon2id\$/);
      expect(stored).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('rejects an existing email and a lost unique-constraint race', async () => {
      usersRepository.findUserByEmail.mockResolvedValueOnce({ id: 1, passwordHash: 'x', isActive: true });
      await expect(
        service.register({ name: 'J', email: 'jane@example.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);

      usersRepository.findUserByEmail.mockResolvedValueOnce(null);
      usersRepository.createUser.mockResolvedValueOnce(null);
      await expect(
        service.register({ name: 'J', email: 'jane@example.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('issues tokens and persists only the refresh-token hash', async () => {
      const passwordHash = await hash('password123', ARGON2_OPTIONS);
      usersRepository.findUserByEmail.mockResolvedValue({ id: 7, passwordHash, isActive: true });

      const tokens = await service.login({ email: 'jane@example.com', password: 'password123' });

      const persisted = sessionRepository.createSession.mock.calls[0][0];
      expect(persisted.tokenHash).toBe(hashRefreshToken(tokens.refreshToken));
      expect(persisted.tokenHash).not.toBe(tokens.refreshToken);
      expect(tokens.expiresIn).toBe(900);

      const claims = await jwtService.verifyAsync<{ sub: string; sid: string }>(tokens.accessToken);
      expect(claims.sub).toBe('7');
      expect(claims.sid).toBe(persisted.familyId);
    });

    it('returns the same error for unknown email and wrong password', async () => {
      usersRepository.findUserByEmail.mockResolvedValueOnce(null);
      const unknown = service.login({ email: 'nobody@example.com', password: 'password123' });
      await expect(unknown).rejects.toThrow(new UnauthorizedException('Invalid email or password'));

      const passwordHash = await hash('password123', ARGON2_OPTIONS);
      usersRepository.findUserByEmail.mockResolvedValueOnce({ id: 7, passwordHash, isActive: true });
      const wrong = service.login({ email: 'jane@example.com', password: 'wrong-password' });
      await expect(wrong).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    });

    it('rejects inactive users after a correct password', async () => {
      const passwordHash = await hash('password123', ARGON2_OPTIONS);
      usersRepository.findUserByEmail.mockResolvedValue({ id: 7, passwordHash, isActive: false });

      await expect(
        service.login({ email: 'jane@example.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(sessionRepository.createSession).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rotates the token within the same session family', async () => {
      const session = activeSession();
      sessionRepository.findSessionByTokenHash.mockResolvedValue(session);
      sessionRepository.rotateSession.mockResolvedValue(true);

      const tokens = await service.refresh('old-token');

      expect(sessionRepository.findSessionByTokenHash).toHaveBeenCalledWith(hashRefreshToken('old-token'));
      const [rotatedId, next] = sessionRepository.rotateSession.mock.calls[0];
      expect(rotatedId).toBe(session.id);
      expect(next.familyId).toBe(session.familyId);
      expect(next.tokenHash).toBe(hashRefreshToken(tokens.refreshToken));
      expect(tokens.refreshToken).not.toBe('old-token');
    });

    it('revokes the whole family when an already-rotated token is replayed', async () => {
      const session = activeSession({
        revokedAt: new Date(),
        revokedReason: SessionRevocationReason.ROTATED,
      });
      sessionRepository.findSessionByTokenHash.mockResolvedValue(session);

      await expect(service.refresh('stolen-token')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sessionRepository.revokeSessionFamily).toHaveBeenCalledWith(
        session.familyId,
        SessionRevocationReason.REUSE_DETECTED,
      );
      expect(sessionRepository.rotateSession).not.toHaveBeenCalled();
    });

    it('treats losing a concurrent rotation race as reuse', async () => {
      const session = activeSession();
      sessionRepository.findSessionByTokenHash.mockResolvedValue(session);
      sessionRepository.rotateSession.mockResolvedValue(false);

      await expect(service.refresh('raced-token')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sessionRepository.revokeSessionFamily).toHaveBeenCalledWith(
        session.familyId,
        SessionRevocationReason.REUSE_DETECTED,
      );
    });

    it('rejects logged-out, expired, and unknown tokens without revoking anything', async () => {
      sessionRepository.findSessionByTokenHash.mockResolvedValueOnce(
        activeSession({ revokedAt: new Date(), revokedReason: SessionRevocationReason.LOGOUT }),
      );
      await expect(service.refresh('a')).rejects.toBeInstanceOf(UnauthorizedException);

      sessionRepository.findSessionByTokenHash.mockResolvedValueOnce(
        activeSession({ expiresAt: new Date(Date.now() - 1000) }),
      );
      await expect(service.refresh('b')).rejects.toBeInstanceOf(UnauthorizedException);

      sessionRepository.findSessionByTokenHash.mockResolvedValueOnce(null);
      await expect(service.refresh('c')).rejects.toBeInstanceOf(UnauthorizedException);

      expect(sessionRepository.revokeSessionFamily).not.toHaveBeenCalled();
      expect(sessionRepository.rotateSession).not.toHaveBeenCalled();
    });

    it('revokes the family of a deactivated user', async () => {
      const session = activeSession({ user: { isActive: false } });
      sessionRepository.findSessionByTokenHash.mockResolvedValue(session);

      await expect(service.refresh('token')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sessionRepository.revokeSessionFamily).toHaveBeenCalledWith(
        session.familyId,
        SessionRevocationReason.USER_INACTIVE,
      );
    });
  });

  describe('logout', () => {
    it('revokes only the current session of the authenticated user', async () => {
      await service.logout({ userId: 7, sessionId: 'family-1' });
      expect(sessionRepository.revokeSession).toHaveBeenCalledWith(
        7,
        'family-1',
        SessionRevocationReason.LOGOUT,
      );
    });

    it('revokes all sessions on logout-all', async () => {
      await service.logoutAll({ userId: 7, sessionId: 'family-1' });
      expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledWith(
        7,
        SessionRevocationReason.LOGOUT_ALL,
      );
    });
  });

  describe('getProfile', () => {
    it('rejects deleted or deactivated users', async () => {
      usersRepository.findUserById.mockResolvedValueOnce(null);
      await expect(service.getProfile({ userId: 7, sessionId: 's' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      usersRepository.findUserById.mockResolvedValueOnce({ ...publicUser, isActive: false });
      await expect(service.getProfile({ userId: 7, sessionId: 's' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
