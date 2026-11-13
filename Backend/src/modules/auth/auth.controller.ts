import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { BEARER_AUTH_NAME, RATE_LIMITS } from '../../common/constants/auth.constants.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { ApiEmptyResponseDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { AuthService } from './auth.service.js';
import {
  AuthTokensDto,
  AuthTokensResponseDto,
  UserProfileDto,
  UserProfileResponseDto,
} from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Auth')
@ApiBadRequestResponse({ description: 'Request body failed validation', type: ApiErrorResponseDto })
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded', type: ApiErrorResponseDto })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: RATE_LIMITS.register })
  @ResponseMessage('Registration successful')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiCreatedResponse({ type: UserProfileResponseDto })
  @ApiConflictResponse({ description: 'Email already registered', type: ApiErrorResponseDto })
  register(@Body() dto: RegisterDto): Promise<UserProfileDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: RATE_LIMITS.login })
  @ResponseMessage('Login successful')
  @ApiOperation({ summary: 'Exchange email and password for an access and refresh token' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password', type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Account is disabled', type: ApiErrorResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: RATE_LIMITS.refresh })
  @ResponseMessage('Token refreshed')
  @ApiOperation({
    summary: 'Rotate the refresh token',
    description:
      'Returns a new access token and a new refresh token. The submitted refresh token becomes ' +
      'invalid immediately. Re-using an already rotated token revokes the entire session. ' +
      'Clients must not send concurrent refresh requests with the same token.',
  })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is invalid, expired, revoked, or was reused',
    type: ApiErrorResponseDto,
  })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Logged out successfully')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Revoke the refresh session that issued the current access token' })
  @ApiOkResponse({ type: ApiEmptyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token', type: ApiErrorResponseDto })
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authService.logout(user);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Logged out from all devices')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Revoke every refresh session of the current user' })
  @ApiOkResponse({ type: ApiEmptyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token', type: ApiErrorResponseDto })
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authService.logoutAll(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('User profile retrieved')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token', type: ApiErrorResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return this.authService.getProfile(user);
  }
}
