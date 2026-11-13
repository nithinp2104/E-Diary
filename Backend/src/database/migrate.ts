/**
 * Standalone migration runner (Umzug). Executed migrations are recorded in the
 * `sequelize_meta` table, so `up` only runs what is pending and is safe to repeat.
 *
 *   node dist/database/migrate.js up            apply all pending migrations
 *   node dist/database/migrate.js down          roll back the most recent migration
 *   node dist/database/migrate.js down --to 0   roll back everything
 *   node dist/database/migrate.js pending|executed
 *
 * Use the `db:migrate*` npm scripts, which build first and load `.env`.
 */
import 'reflect-metadata';
import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import { MIGRATIONS_TABLE } from '../common/constants/database.constants.js';
import { toDatabaseConfig } from '../config/database.config.js';
import { validateDatabaseEnv } from '../config/env.validation.js';
import { createUsersTable } from './migrations/20261113000001-create-users.js';
import { createRefreshSessionsTable } from './migrations/20261113000002-create-refresh-sessions.js';
import type { Migration, MigrationContext } from './migrations/migration-context.js';
import { buildSequelizeOptions } from './sequelize.config.js';

/** Ordered list of migrations. Append new migrations here; never reorder or edit applied ones. */
const MIGRATIONS: Migration[] = [createUsersTable, createRefreshSessionsTable];

async function main(): Promise<void> {
  const env = validateDatabaseEnv(process.env);
  const sequelize = new Sequelize(buildSequelizeOptions(toDatabaseConfig((key) => env[key])));

  const umzug = new Umzug<MigrationContext>({
    migrations: MIGRATIONS,
    context: { queryInterface: sequelize.getQueryInterface(), sequelize },
    storage: new SequelizeStorage({ sequelize, tableName: MIGRATIONS_TABLE }),
    logger: console,
  });

  try {
    await umzug.runAsCLI(process.argv.slice(2));
  } finally {
    await sequelize.close();
  }
}

await main();
