import type { DatabaseDialect, DatabaseEnvironmentVariables } from './env.validation.js';

export interface DatabaseConfig {
  dialect: DatabaseDialect;
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  ssl: boolean;
}

type DatabaseVariableReader = <K extends keyof DatabaseEnvironmentVariables>(
  key: K,
) => DatabaseEnvironmentVariables[K];

/**
 * Single mapping from validated environment variables to database settings, shared by
 * the Nest application (via ConfigService) and the standalone migration runner.
 */
export function toDatabaseConfig(read: DatabaseVariableReader): DatabaseConfig {
  return {
    dialect: read('DATABASE_DIALECT'),
    host: read('DATABASE_HOST'),
    port: read('DATABASE_PORT'),
    name: read('DATABASE_NAME'),
    username: read('DATABASE_USER'),
    password: read('DATABASE_PASSWORD'),
    ssl: read('DATABASE_SSL'),
  };
}
