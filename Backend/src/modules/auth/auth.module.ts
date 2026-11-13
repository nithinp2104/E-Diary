import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { JWT_ALGORITHM, JWT_STRATEGY } from '../../common/constants/auth.constants.js';
import { AppConfigService } from '../../config/app-config.service.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RefreshSession } from './models/refresh-session.model.js';
import { RefreshSessionRepository } from './repositories/refresh-session.repository.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    SequelizeModule.forFeature([RefreshSession]),
    UsersModule,
    PassportModule.register({ defaultStrategy: JWT_STRATEGY, session: false }),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwt.accessSecret,
        signOptions: {
          algorithm: JWT_ALGORITHM,
          expiresIn: config.jwt.accessExpiresInSeconds,
        },
        verifyOptions: { algorithms: [JWT_ALGORITHM] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshSessionRepository, JwtStrategy],
})
export class AuthModule {}
