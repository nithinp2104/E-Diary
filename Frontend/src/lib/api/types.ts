/** Success envelope produced by the backend ResponseInterceptor. */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
}

/** Error envelope produced by the backend HttpExceptionFilter. */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  /** Present on 400 responses: one class-validator message per failed rule. */
  errors?: string[];
  path: string;
  timestamp: string;
}
