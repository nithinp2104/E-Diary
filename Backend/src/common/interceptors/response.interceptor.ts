import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { DEFAULT_SUCCESS_MESSAGE } from '../constants/app.constants.js';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
}

/** Wraps every successful controller result in `{ success, message, data }`. */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T>> {
    const message =
      this.reflector.get<string | undefined>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      DEFAULT_SUCCESS_MESSAGE;

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        message,
        data: data ?? null,
      })),
    );
  }
}
