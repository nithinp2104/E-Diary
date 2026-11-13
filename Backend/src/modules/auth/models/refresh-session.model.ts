import type { Optional } from 'sequelize';
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import type { Relation } from '../../../common/types/relation.type.js';
import { User } from '../../users/models/user.model.js';
import { SessionRevocationReason } from '../enums/session-revocation-reason.enum.js';

export interface RefreshSessionAttributes {
  id: number;
  userId: number;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedReason: SessionRevocationReason | null;
  replacedById: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RefreshSessionCreationAttributes = Optional<
  RefreshSessionAttributes,
  'id' | 'revokedAt' | 'revokedReason' | 'replacedById' | 'createdAt' | 'updatedAt'
>;

/**
 * One row per issued refresh token. All tokens descending from a single login share a
 * familyId; rotation revokes the current row and links it to its successor.
 */
@Table({
  tableName: 'refresh_sessions',
  underscored: true,
  timestamps: true,
  indexes: [
    { name: 'refresh_sessions_family_id_revoked_at_idx', fields: ['family_id', 'revoked_at'] },
    { name: 'refresh_sessions_user_id_revoked_at_idx', fields: ['user_id', 'revoked_at'] },
  ],
})
export class RefreshSession extends Model<RefreshSessionAttributes, RefreshSessionCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  override id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId: number;

  /** Session identifier shared by every token from one login (not an entity id). */
  @AllowNull(false)
  @Column(DataType.UUID)
  familyId: string;

  /** SHA-256 hex digest of the opaque refresh token. The plaintext is never stored. */
  @AllowNull(false)
  @Unique('refresh_sessions_token_hash_key')
  @Column(DataType.CHAR(64))
  tokenHash: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  revokedAt: Date | null;

  @AllowNull(true)
  @Column(DataType.ENUM(...Object.values(SessionRevocationReason)))
  revokedReason: SessionRevocationReason | null;

  /** Successor token issued when this one was rotated (self-referencing FK, see migration). */
  @AllowNull(true)
  @Unique('refresh_sessions_replaced_by_id_key')
  @Column(DataType.INTEGER)
  replacedById: number | null;

  @CreatedAt
  @Column(DataType.DATE)
  override createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  override updatedAt: Date;

  @BelongsTo(() => User, { foreignKey: 'userId', onDelete: 'CASCADE' })
  user?: Relation<User>;
}
