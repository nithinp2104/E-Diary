import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { randomUUID } from 'node:crypto';
import { ARGON2_OPTIONS, AUTH_MESSAGES } from '../../common/constants/auth.constants.js';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../../common/interfaces/authenticated-user.interface.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { type PublicUser, UsersRepository } from '../users/repositories/users.repository.js';
import type { AuthTokensDto, UserProfileDto } from './dto/auth-response.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { SessionRevocationReason } from './enums/session-revocation-reason.enum.js';
import {
  RefreshSessionRepository,
  type RefreshSessionLookup,
} from './repositories/refresh-session.repository.js';
import { generateRefreshToken, hashRefreshToken } from './utils/token.util.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** Hash compared against when the email is unknown, so login timing does not reveal account existence. */
  private dummyPasswordHash?: Promise<string>;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<UserProfileDto> {
    const existing = await this.usersRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException(AUTH_MESSAGES.emailTaken);
    }

    const passwordHash = await hash(dto.password, ARGON2_OPTIONS);
    const user = await this.usersRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    if (!user) {
      throw new ConflictException(AUTH_MESSAGES.emailTaken);
    }

    return this.toUserProfile(user);
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.usersRepository.findUserByEmail(dto.email);
    const passwordMatches = await this.verifyPassword(user?.passwordHash, dto.password);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException(AUTH_MESSAGES.invalidCredentials);
    }
    // Only disclosed after the password is proven, so it reveals nothing to an attacker.
    if (!user.isActive) {
      throw new ForbiddenException(AUTH_MESSAGES.accountDisabled);
    }

    return this.startSession(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const session = await this.refreshSessionRepository.findSessionByTokenHash(
      hashRefreshToken(refreshToken),
    );

    if (!session) {
      throw new UnauthorizedException(AUTH_MESSAGES.invalidRefreshToken);
    }

    if (session.revokedAt) {
      // A token that was already exchanged is being presented again: either the client
      // is replaying it or it was stolen. Kill the whole family so the thief's copy dies too.
      if (session.revokedReason === SessionRevocationReason.ROTATED) {
        await this.revokeFamilyForReuse(session);
      }
      throw new UnauthorizedException(AUTH_MESSAGES.invalidRefreshToken);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(AUTH_MESSAGES.invalidRefreshToken);
    }

    if (!session.user.isActive) {
      await this.refreshSessionRepository.revokeSessionFamily(
        session.familyId,
        SessionRevocationReason.USER_INACTIVE,
      );
      throw new UnauthorizedException(AUTH_MESSAGES.invalidRefreshToken);
    }

    const nextRefreshToken = generateRefreshToken();
    const rotated = await this.refreshSessionRepository.rotateSession(session.id, {
      userId: session.userId,
      familyId: session.familyId,
      tokenHash: hashRefreshToken(nextRefreshToken),
      expiresAt: this.refreshTokenExpiry(),
    });

    if (!rotated) {
      // Another request consumed this token between our read and the atomic claim.
      await this.revokeFamilyForReuse(session);
      throw new UnauthorizedException(AUTH_MESSAGES.invalidRefreshToken);
    }

    return this.issueTokens(session.userId, session.familyId, nextRefreshToken);
  }

  async logout(user: AuthenticatedUser): Promise<void> {
    await this.refreshSessionRepository.revokeSession(
      user.userId,
      user.sessionId,
      SessionRevocationReason.LOGOUT,
    );
  }

  async logoutAll(user: AuthenticatedUser): Promise<void> {
    await this.refreshSessionRepository.revokeAllUserSessions(
      user.userId,
      SessionRevocationReason.LOGOUT_ALL,
    );
  }

  async getProfile(user: AuthenticatedUser): Promise<UserProfileDto> {
    const profile = await this.usersRepository.findUserById(user.userId);
    if (!profile || !profile.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.sessionNotFound);
    }
    return this.toUserProfile(profile);
  }

  private async startSession(userId: number): Promise<AuthTokensDto> {
    const familyId = randomUUID();
    const refreshToken = generateRefreshToken();

    await this.refreshSessionRepository.createSession({
      userId,
      familyId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: this.refreshTokenExpiry(),
    });

    return this.issueTokens(userId, familyId, refreshToken);
  }

  private async issueTokens(
    userId: number,
    familyId: string,
    refreshToken: string,
  ): Promise<AuthTokensDto> {
    const payload: AccessTokenPayload = { sub: String(userId), sid: familyId };
    const { accessExpiresInSeconds, refreshExpiresInSeconds } = this.config.jwt;

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresInSeconds,
      refreshTokenExpiresIn: refreshExpiresInSeconds,
    };
  }

  private async revokeFamilyForReuse(session: RefreshSessionLookup): Promise<void> {
    const revoked = await this.refreshSessionRepository.revokeSessionFamily(
      session.familyId,
      SessionRevocationReason.REUSE_DETECTED,
    );
    this.logger.warn(
      `Refresh token reuse detected for user ${session.userId}, session ${session.familyId}; revoked ${revoked} token(s)`,
    );
  }

  private async verifyPassword(passwordHash: string | undefined, password: string): Promise<boolean> {
    if (!passwordHash) {
      this.dummyPasswordHash ??= hash(randomUUID(), ARGON2_OPTIONS);
      await verify(await this.dummyPasswordHash, password);
      return false;
    }

    try {
      return await verify(passwordHash, password);
    } catch {
      // A malformed stored hash must fail closed rather than surface as a 500.
      this.logger.error('Stored password hash could not be verified');
      return false;
    }
  }

  private refreshTokenExpiry(): Date {
    return new Date(Date.now() + this.config.jwt.refreshExpiresInSeconds * 1000);
  }

  private toUserProfile(user: PublicUser): UserProfileDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
