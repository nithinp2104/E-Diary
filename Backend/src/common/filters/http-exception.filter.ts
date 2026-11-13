import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
}

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

/**
 * Converts every thrown error into a consistent error envelope.
 * Unexpected errors are logged server-side and returned as a generic 500 so that
 * stack traces, SQL, and other internals never reach API consumers.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const { statusCode, message, errors } = this.resolve(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Log only the error itself and the route — never headers or bodies, which carry credentials.
      const detail = exception instanceof Error ? (exception.stack ?? exception.message) : String(exception);
      this.logger.error(`${request.method} ${request.path} failed: ${detail}`);
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      ...(errors ? { errors } : {}),
      path: request.path,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private resolve(exception: unknown): { statusCode: number; message: string; errors?: string[] } {
    if (!(exception instanceof HttpException)) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: INTERNAL_ERROR_MESSAGE };
    }

    const statusCode = exception.getStatus();
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return { statusCode, message: INTERNAL_ERROR_MESSAGE };
    }

    const payload = exception.getResponse();
    if (typeof payload === 'string') {
      return { statusCode, message: payload };
    }

    const payloadMessage = (payload as { message?: unknown }).message;
    if (Array.isArray(payloadMessage)) {
      // ValidationPipe reports one entry per failed constraint.
      return {
        statusCode,
        message: 'Validation failed',
        errors: payloadMessage.filter((entry): entry is string => typeof entry === 'string'),
      };
    }

    return {
      statusCode,
      message: typeof payloadMessage === 'string' ? payloadMessage : exception.message,
    };
  }
}
