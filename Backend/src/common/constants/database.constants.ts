/** Connection pool sizing per application instance. */
export const DATABASE_POOL = {
  max: 10,
  min: 0,
  /** ms a connection may sit idle before being released. */
  idle: 10_000,
  /** ms to wait for a free connection before erroring. */
  acquire: 30_000,
} as const;

/** Startup connection retries before the application gives up. */
export const DATABASE_CONNECT_RETRY = {
  attempts: 5,
  delayMs: 3_000,
} as const;

/** Table in which Umzug records executed migrations. */
export const MIGRATIONS_TABLE = 'sequelize_meta';
