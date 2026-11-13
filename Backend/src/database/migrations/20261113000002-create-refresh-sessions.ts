import { DataTypes } from 'sequelize';
import type { Migration } from './migration-context.js';

const TABLE = 'refresh_sessions';
/** Name Sequelize gives the PostgreSQL enum type created for `revoked_reason`. */
const REVOKED_REASON_ENUM = 'enum_refresh_sessions_revoked_reason';

export const createRefreshSessionsTable: Migration = {
  name: '20261113000002-create-refresh-sessions',

  async up({ context: { queryInterface, sequelize } }) {
    await sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        TABLE,
        {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          family_id: { type: DataTypes.UUID, allowNull: false },
          token_hash: { type: DataTypes.CHAR(64), allowNull: false },
          expires_at: { type: DataTypes.DATE, allowNull: false },
          revoked_at: { type: DataTypes.DATE, allowNull: true },
          revoked_reason: {
            type: DataTypes.ENUM('ROTATED', 'LOGOUT', 'LOGOUT_ALL', 'REUSE_DETECTED', 'USER_INACTIVE'),
            allowNull: true,
          },
          replaced_by_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: TABLE, key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
          },
        },
        { transaction },
      );

      await queryInterface.addConstraint(TABLE, {
        type: 'unique',
        name: 'refresh_sessions_token_hash_key',
        fields: ['token_hash'],
        transaction,
      });
      await queryInterface.addConstraint(TABLE, {
        type: 'unique',
        name: 'refresh_sessions_replaced_by_id_key',
        fields: ['replaced_by_id'],
        transaction,
      });
      await queryInterface.addIndex(TABLE, ['family_id', 'revoked_at'], {
        name: 'refresh_sessions_family_id_revoked_at_idx',
        transaction,
      });
      await queryInterface.addIndex(TABLE, ['user_id', 'revoked_at'], {
        name: 'refresh_sessions_user_id_revoked_at_idx',
        transaction,
      });
    });
  },

  async down({ context: { queryInterface, sequelize } }) {
    await sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable(TABLE, { transaction });
      // dropTable leaves PostgreSQL enum types behind.
      await sequelize.query(`DROP TYPE IF EXISTS "${REVOKED_REASON_ENUM}"`, { transaction });
    });
  },
};
