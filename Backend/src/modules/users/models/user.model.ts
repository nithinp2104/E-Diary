import type { Optional } from 'sequelize';
import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH } from '../../../common/constants/auth.constants.js';
import type { Relation } from '../../../common/types/relation.type.js';
import { RefreshSession } from '../../auth/models/refresh-session.model.js';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'isActive' | 'createdAt' | 'updatedAt'
>;

@Table({ tableName: 'users', underscored: true, timestamps: true })
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  override id: number;

  @AllowNull(false)
  @Column(DataType.STRING(NAME_MAX_LENGTH))
  name: string;

  /** Stored normalized (trimmed, lower-cased); uniqueness is enforced by the database. */
  @AllowNull(false)
  @Unique('users_email_key')
  @Column(DataType.STRING(EMAIL_MAX_LENGTH))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  passwordHash: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  override createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  override updatedAt: Date;

  @HasMany(() => RefreshSession, 'userId')
  refreshSessions?: Relation<RefreshSession[]>;
}
