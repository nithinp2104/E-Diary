import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DATABASE_CONNECT_RETRY } from '../common/constants/database.constants.js';
import { AppConfigService } from '../config/app-config.service.js';
import { buildSequelizeOptions } from './sequelize.config.js';

/**
 * Registers the single Sequelize connection. Feature modules add their models with
 * `SequelizeModule.forFeature()`, and `autoLoadModels` attaches them to this connection.
 *
 * Schema changes are applied only through version-controlled migrations (`npm run db:migrate`);
 * `synchronize` is disabled so models never alter tables at startup.
 * The connection is verified on startup (with retries) and closed on application shutdown.
 */
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        ...buildSequelizeOptions(config.database),
        autoLoadModels: true,
        synchronize: false,
        retryAttempts: DATABASE_CONNECT_RETRY.attempts,
        retryDelay: DATABASE_CONNECT_RETRY.delayMs,
      }),
    }),
  ],
})
export class DatabaseModule {}
