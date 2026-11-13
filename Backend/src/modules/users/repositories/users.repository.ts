import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { User, type UserAttributes } from '../models/user.model.js';

/** Safe, public view of a user. Never includes the password hash. */
export type PublicUser = Omit<UserAttributes, 'passwordHash'>;
/** Minimum data needed to verify a login. */
export type UserCredentials = Pick<UserAttributes, 'id' | 'passwordHash' | 'isActive'>;

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

/** Email changes are intentionally excluded: they would need re-verification and uniqueness handling. */
export type UpdateUserData = Partial<Pick<UserAttributes, 'name' | 'passwordHash' | 'isActive'>>;

const PUBLIC_USER_ATTRIBUTES = [
  'id',
  'name',
  'email',
  'isActive',
  'createdAt',
  'updatedAt',
] as const satisfies readonly (keyof PublicUser)[];

const USER_CREDENTIALS_ATTRIBUTES = [
  'id',
  'passwordHash',
  'isActive',
] as const satisfies readonly (keyof UserCredentials)[];

/**
 * Model instances never leave this class: every method returns plain objects, so callers
 * cannot lazily load associations or persist changes outside the repository.
 */
@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  /** Email must already be normalized. */
  async findUserByEmail(email: string): Promise<UserCredentials | null> {
    const user = await this.userModel.findOne({
      where: { email },
      attributes: [...USER_CREDENTIALS_ATTRIBUTES],
    });
    return user ? { id: user.id, passwordHash: user.passwordHash, isActive: user.isActive } : null;
  }

  async findUserById(id: number): Promise<PublicUser | null> {
    const user = await this.userModel.findByPk(id, { attributes: [...PUBLIC_USER_ATTRIBUTES] });
    return user ? toPublicUser(user) : null;
  }

  /**
   * Inserts a user. Returns `null` when the email unique constraint rejects the insert,
   * which covers the race where two registrations for the same email run concurrently.
   */
  async createUser(data: CreateUserData): Promise<PublicUser | null> {
    try {
      const user = await this.userModel.create(data);
      return toPublicUser(user);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return null;
      }
      throw error;
    }
  }

  /** Returns the updated user, or `null` when no user has this id. */
  async updateUser(id: number, changes: UpdateUserData): Promise<PublicUser | null> {
    const [, updated] = await this.userModel.update(changes, {
      where: { id },
      returning: [...PUBLIC_USER_ATTRIBUTES],
    });
    return updated.length > 0 ? toPublicUser(updated[0]) : null;
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
