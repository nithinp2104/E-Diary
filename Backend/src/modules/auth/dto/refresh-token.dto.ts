import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Opaque refresh token returned by /auth/login or the previous /auth/refresh call.',
    example: 'q1v9yJ3m0Zx8bW4n5Tt2kR7cLp6sHd0aUe1fGi2jKo4',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  refreshToken: string;
}
