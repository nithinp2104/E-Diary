import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toDatabaseConfig, type DatabaseConfig } from './database.config.js';
import { EnvironmentVariables, NodeEnvironment } from './env.validation.js';

export interface ApplicationConfig {
  nodeEnv: NodeEnvironment;
  isProduction: boolean;
  port: number;
  corsOrigins: string[];
  trustProxy: boolean;
}

export interface JwtConfig {
  accessSecret: string;
  accessExpiresInSeconds: number;
  refreshExpiresInSeconds: number;
}

/** Single typed entry point for validated configuration, grouped by concern. */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  get app(): ApplicationConfig {
    const nodeEnv = this.config.get('NODE_ENV', { infer: true });
    const corsOrigins = this.config.get('CORS_ORIGINS', { infer: true }) ?? '';

    return {
      nodeEnv,
      isProduction: nodeEnv === NodeEnvironment.Production,
      port: this.config.get('PORT', { infer: true }),
      corsOrigins: corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
      trustProxy: this.config.get('TRUST_PROXY', { infer: true }),
    };
  }

  get database(): DatabaseConfig {
    return toDatabaseConfig((key) => this.config.get(key, { infer: true }));
  }

  get jwt(): JwtConfig {
    return {
      accessSecret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      accessExpiresInSeconds: this.config.get('JWT_ACCESS_EXPIRES_IN', { infer: true }),
      refreshExpiresInSeconds: this.config.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true }),
    };
  }
}
