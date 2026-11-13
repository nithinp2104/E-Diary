import { DataTypes } from 'sequelize';
import type { Migration } from './migration-context.js';

export const createUsersTable: Migration = {
  name: '20261113000001-create-users',

  async up({ context: { queryInterface, sequelize } }) {
    await sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'users',
        {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          name: { type: DataTypes.STRING(100), allowNull: false },
          email: { type: DataTypes.STRING(254), allowNull: false },
          password_hash: { type: DataTypes.STRING(255), allowNull: false },
          is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
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

      await queryInterface.addConstraint('users', {
        type: 'unique',
        name: 'users_email_key',
        fields: ['email'],
        transaction,
      });
    });
  },

  async down({ context: { queryInterface, sequelize } }) {
    await sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('users', { transaction });
    });
  },
};
