import type { QueryInterface, Sequelize } from 'sequelize';
import type { RunnableMigration } from 'umzug';

export interface MigrationContext {
  queryInterface: QueryInterface;
  sequelize: Sequelize;
}

export type Migration = RunnableMigration<MigrationContext>;
