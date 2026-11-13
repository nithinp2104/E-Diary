import { plainToInstance, Transform, type ClassConstructor } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const SUPPORTED_DATABASE_DIALECTS = ['postgres'] as const;
export type DatabaseDialect = (typeof SUPPORTED_DATABASE_DIALECTS)[number];

/**
 * Reads the raw value: with implicit conversion enabled, `value` has already been passed
 * through `Boolean()`, which would turn the string "false" into `true`.
 */
const toBoolean = ({ obj, key }: { obj: Record<string, unknown>; key: string }): boolean =>
  obj[key] === true || obj[key] === 'true';

/**
 * Variables needed to reach the database. Kept separate so the migration runner can
 * validate only these, without requiring application secrets such as the JWT key.
 */
export class DatabaseEnvironmentVariables {
  @IsIn(SUPPORTED_DATABASE_DIALECTS)
  DATABASE_DIALECT: DatabaseDialect = 'postgres';

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  /** May be empty for local trust authentication, but must be set explicitly. */
  @IsString()
  DATABASE_PASSWORD: string;

  /** Enable TLS with certificate verification (managed / production databases). */
  @Transform(toBoolean)
  @IsBoolean()
  DATABASE_SSL: boolean = false;
}

export class EnvironmentVariables extends DatabaseEnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  /** Comma-separated list of allowed browser origins. Native mobile clients do not need CORS. */
  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  /** Set to true behind a reverse proxy / load balancer so rate limiting sees real client IPs. */
  @Transform(toBoolean)
  @IsBoolean()
  TRUST_PROXY: boolean = false;

  @IsString()
  @MinLength(32, { message: 'JWT_ACCESS_SECRET must be at least 32 characters' })
  JWT_ACCESS_SECRET: string;

  /** Access-token lifetime in seconds. */
  @IsInt()
  @Min(60)
  @Max(3600)
  JWT_ACCESS_EXPIRES_IN: number = 900;

  /** Refresh-token lifetime in seconds. */
  @IsInt()
  @Min(3600)
  @Max(60 * 60 * 24 * 365)
  REFRESH_TOKEN_EXPIRES_IN: number = 60 * 60 * 24 * 30;
}

function validate<T extends object>(schema: ClassConstructor<T>, config: Record<string, unknown>): T {
  const validated = plainToInstance(schema, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('\n  - ');
    throw new Error(`Invalid environment configuration:\n  - ${details}`);
  }

  return validated;
}

/** Fails application startup when required variables are missing or malformed. */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  return validate(EnvironmentVariables, config);
}

export function validateDatabaseEnv(config: Record<string, unknown>): DatabaseEnvironmentVariables {
  return validate(DatabaseEnvironmentVariables, config);
}
