import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger schema for the error envelope produced by HttpExceptionFilter. */
export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid email or password' })
  message: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Present on 400 responses: one entry per failed validation rule.',
    example: ['email must be an email'],
  })
  errors?: string[];

  @ApiProperty({ example: '/auth/login' })
  path: string;

  @ApiProperty({ example: '2026-11-13T10:00:00.000Z' })
  timestamp: string;
}

/** Swagger schema for success responses that carry no data. */
export class ApiEmptyResponseDto {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 'Logged out successfully' })
  message: string;

  @ApiProperty({ type: 'null', nullable: true, example: null })
  data: null;
}
