import { isAxiosError } from 'axios';

import type { ApiErrorResponse, ApiSuccessResponse } from './types';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'rate_limited'
  | 'server'
  | 'invalid_response'
  | 'unknown';

/** Normalized, UI-safe error. Never carries request bodies or headers. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  /** Raw backend validation messages, e.g. "email must be an email". */
  readonly validationErrors: string[];

  constructor(kind: ApiErrorKind, message: string, status: number | null = null, validationErrors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.validationErrors = validationErrors;
  }

  /** True when the server could not be reached; the request may succeed if retried. */
  get isConnectivityIssue(): boolean {
    return this.kind === 'network' || this.kind === 'timeout';
  }
}

const GENERIC_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'Unable to reach the server. Check your internet connection and try again.',
  timeout: 'The server took too long to respond. Please try again.',
  validation: 'Some details are invalid. Please review and try again.',
  unauthorized: 'You are not signed in.',
  forbidden: 'You do not have access to this resource.',
  conflict: 'This request conflicts with existing data.',
  rate_limited: 'Too many attempts. Please wait a minute and try again.',
  server: 'Something went wrong on our side. Please try again later.',
  invalid_response: 'Received an unexpected response from the server.',
  unknown: 'Something went wrong. Please try again.',
};

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { success?: unknown }).success === false &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!isAxiosError(error)) {
    return new ApiError('unknown', GENERIC_MESSAGES.unknown);
  }

  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return timedOut
      ? new ApiError('timeout', GENERIC_MESSAGES.timeout)
      : new ApiError('network', GENERIC_MESSAGES.network);
  }

  const { status, data } = error.response;
  const kind = kindFromStatus(status);

  if (isApiErrorResponse(data)) {
    const validationErrors = Array.isArray(data.errors)
      ? data.errors.filter((entry): entry is string => typeof entry === 'string')
      : [];
    // 5xx bodies are already generic on the backend, but keep our own wording for consistency.
    const message = kind === 'server' ? GENERIC_MESSAGES.server : data.message;
    return new ApiError(kind, message, status, validationErrors);
  }

  return new ApiError(kind, GENERIC_MESSAGES[kind], status);
}

/** Returns `data` from a success envelope, rejecting malformed responses. */
export function unwrapData<T>(body: ApiSuccessResponse<T>, isValid: (data: unknown) => data is T): T {
  if (body?.success !== true || !isValid(body.data)) {
    throw new ApiError('invalid_response', GENERIC_MESSAGES.invalid_response);
  }
  return body.data;
}

/**
 * Groups backend class-validator messages by the property they refer to.
 * class-validator messages start with the property name, e.g. "password must be longer than ...".
 */
export function groupValidationErrors<Field extends string>(
  messages: readonly string[],
  fields: readonly Field[],
): Partial<Record<Field, string>> {
  const result: Partial<Record<Field, string>> = {};
  for (const message of messages) {
    const field = fields.find((name) => message.startsWith(`${name} `));
    if (field && !result[field]) {
      result[field] = message.charAt(0).toUpperCase() + message.slice(1) + '.';
    }
  }
  return result;
}
