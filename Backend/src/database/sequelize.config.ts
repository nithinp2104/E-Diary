import type { SequelizeOptions } from 'sequelize-typescript';
import { DATABASE_POOL } from '../common/constants/database.constants.js';
import type { DatabaseConfig } from '../config/database.config.js';

/** Connection options shared by the Nest application and the migration runner. */
export function buildSequelizeOptions(config: DatabaseConfig): SequelizeOptions {
  return {
    dialect: config.dialect,
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.username,
    password: config.password,
    // SQL logging is disabled everywhere: bound values include password and token hashes.
    logging: false,
    pool: { ...DATABASE_POOL },
    dialectOptions: config.ssl ? { ssl: { require: true, rejectUnauthorized: true } } : {},
    define: {
      underscored: true,
      timestamps: true,
    },
  };
}
