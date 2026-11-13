import { groupValidationErrors, toApiError } from '@/lib/api/errors';

import type { FieldErrors, LoginFormValues, RegisterFormValues } from '../validation/auth.validation';

export interface FormErrorResult<Field extends string> {
  /** Message for the whole form (banner). */
  formError: string | null;
  fieldErrors: FieldErrors<Field>;
}

/** Maps a login failure to user-facing messages. */
export function mapLoginError(error: unknown): FormErrorResult<keyof LoginFormValues> {
  const apiError = toApiError(error);

  switch (apiError.kind) {
    case 'unauthorized':
      // Backend deliberately does not reveal whether the email exists.
      return { formError: 'Invalid email or password.', fieldErrors: {} };
    case 'forbidden':
      return {
        formError: 'Your account is disabled. Please contact your administrator.',
        fieldErrors: {},
      };
    case 'validation': {
      const fieldErrors = groupValidationErrors(apiError.validationErrors, ['email', 'password'] as const);
      return { formError: Object.keys(fieldErrors).length ? null : apiError.message, fieldErrors };
    }
    default:
      return { formError: apiError.message, fieldErrors: {} };
  }
}

/** Maps a registration failure to user-facing messages. */
export function mapRegisterError(error: unknown): FormErrorResult<keyof RegisterFormValues> {
  const apiError = toApiError(error);

  switch (apiError.kind) {
    case 'conflict':
      return {
        formError: null,
        fieldErrors: { email: 'An account with this email already exists. Try logging in instead.' },
      };
    case 'validation': {
      const fieldErrors = groupValidationErrors(apiError.validationErrors, ['name', 'email', 'password'] as const);
      return { formError: Object.keys(fieldErrors).length ? null : apiError.message, fieldErrors };
    }
    case 'rate_limited':
      return { formError: 'Too many sign-up attempts. Please try again later.', fieldErrors: {} };
    default:
      return { formError: apiError.message, fieldErrors: {} };
  }
}
