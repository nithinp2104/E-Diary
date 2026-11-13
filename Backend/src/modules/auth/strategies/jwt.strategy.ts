import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ALGORITHM, JWT_STRATEGY } from '../../../common/constants/auth.constants.js';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../../../common/interfaces/authenticated-user.interface.js';
import { AppConfigService } from '../../../config/app-config.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
      algorithms: [JWT_ALGORITHM],
    });
  }

  /** Runs only after signature and expiry checks pass; turns claims into the request identity. */
  validate(payload: Partial<AccessTokenPayload>): AuthenticatedUser {
    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0 || typeof payload.sid !== 'string') {
      throw new UnauthorizedException();
    }

    return { userId, sessionId: payload.sid };
  }
}
