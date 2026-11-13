import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY } from '../constants/auth.constants.js';

/** Requires a valid `Authorization: Bearer <access_token>` header. */
@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY) {}
