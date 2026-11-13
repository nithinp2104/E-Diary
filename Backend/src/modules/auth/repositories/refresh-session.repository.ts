import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../users/models/user.model.js';
import { SessionRevocationReason } from '../enums/session-revocation-reason.enum.js';
import { RefreshSession, type RefreshSessionAttributes } from '../models/refresh-session.model.js';

export type RefreshSessionLookup = Pick<
  RefreshSessionAttributes,
  'id' | 'userId' | 'familyId' | 'expiresAt' | 'revokedAt' | 'revokedReason'
> & { user: { isActive: boolean } };

export interface CreateRefreshSessionData {
  userId: number;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
}

/** All refresh-session persistence. Returns plain objects; model instances never leave this class. */
@Injectable()
export class RefreshSessionRepository {
  constructor(
    @InjectModel(RefreshSession) private readonly refreshSessionModel: typeof RefreshSession,
    private readonly sequelize: Sequelize,
  ) {}

  async createSession(data: CreateRefreshSessionData): Promise<void> {
    await this.refreshSessionModel.create(data);
  }

  async findSessionByTokenHash(tokenHash: string): Promise<RefreshSessionLookup | null> {
    const session = await this.refreshSessionModel.findOne({
      where: { tokenHash },
      attributes: ['id', 'userId', 'familyId', 'expiresAt', 'revokedAt', 'revokedReason'],
      include: [{ model: User, attributes: ['isActive'], required: true }],
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      familyId: session.familyId,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      revokedReason: session.revokedReason,
      user: { isActive: session.user.isActive },
    };
  }

  /**
   * Atomically consumes the current session and inserts its successor.
   *
   * The conditional UPDATE only matches a row that is still active and unexpired, and
   * PostgreSQL's row lock serialises concurrent attempts: the second transaction blocks,
   * then re-evaluates the WHERE clause and matches nothing. Exactly one caller can claim a
   * given token. Returns `false` when the row was already consumed or revoked, in which
   * case the transaction writes nothing.
   */
  async rotateSession(currentSessionId: number, next: CreateRefreshSessionData): Promise<boolean> {
    const now = new Date();

    return this.sequelize.transaction(async (transaction) => {
      const [claimed] = await this.refreshSessionModel.update(
        { revokedAt: now, revokedReason: SessionRevocationReason.ROTATED },
        {
          where: { id: currentSessionId, revokedAt: null, expiresAt: { [Op.gt]: now } },
          transaction,
        },
      );

      if (claimed === 0) {
        return false;
      }

      const successor = await this.refreshSessionModel.create(next, { transaction });
      await this.refreshSessionModel.update(
        { replacedById: successor.id },
        { where: { id: currentSessionId }, transaction },
      );

      return true;
    });
  }

  /** Revokes a session family only if it belongs to the given user. Returns the number revoked. */
  async revokeSession(
    userId: number,
    familyId: string,
    reason: SessionRevocationReason,
  ): Promise<number> {
    return this.revokeActive({ userId, familyId }, reason);
  }

  /** Revokes every still-active token in a session family. Returns the number revoked. */
  async revokeSessionFamily(familyId: string, reason: SessionRevocationReason): Promise<number> {
    return this.revokeActive({ familyId }, reason);
  }

  async revokeAllUserSessions(userId: number, reason: SessionRevocationReason): Promise<number> {
    return this.revokeActive({ userId }, reason);
  }

  private async revokeActive(
    scope: Partial<Pick<RefreshSessionAttributes, 'userId' | 'familyId'>>,
    reason: SessionRevocationReason,
  ): Promise<number> {
    const [count] = await this.refreshSessionModel.update(
      { revokedAt: new Date(), revokedReason: reason },
      { where: { ...scope, revokedAt: null } },
    );
    return count;
  }
}
