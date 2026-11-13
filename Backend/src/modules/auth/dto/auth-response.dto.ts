import { ApiProperty } from '@nestjs/swagger';

/** Safe, public view of a user. Never includes credentials. */
export class UserProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-11-13T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-13T10:00:00.000Z' })
  updatedAt: Date;
}

export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({
    description: 'Opaque, single-use token. Store it in secure storage; every refresh returns a new one.',
    example: 'q1v9yJ3m0Zx8bW4n5Tt2kR7cLp6sHd0aUe1fGi2jKo4',
  })
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: 'Bearer';

  @ApiProperty({ example: 900, description: 'Access-token lifetime in seconds.' })
  expiresIn: number;

  @ApiProperty({ example: 2592000, description: 'Refresh-token lifetime in seconds.' })
  refreshTokenExpiresIn: number;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'User profile retrieved' })
  message: string;

  @ApiProperty({ type: UserProfileDto })
  data: UserProfileDto;
}

export class AuthTokensResponseDto {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ type: AuthTokensDto })
  data: AuthTokensDto;
}
