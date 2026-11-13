import { AUTH_LIMITS } from '../constants';

/** Practical email shape check; the backend performs the authoritative validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Collapses internal whitespace and trims, e.g. "  Jane   Doe " -> "Jane Doe". */
export const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');

/** Matches backend `normalizeEmail`: trimmed and lower-cased. */
export const normalizeEmail = (value: string) => value.trim().toLowerCase();

function validateEmail(value: string): string | undefined {
  const email = normalizeEmail(value);
  if (!email) return 'Enter your email address.';
  if (email.length > AUTH_LIMITS.emailMaxLength) return 'Email address is too long.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return undefined;
}

export function validateLogin(values: LoginFormValues): FieldErrors<keyof LoginFormValues> {
  const errors: FieldErrors<keyof LoginFormValues> = {};
  errors.email = validateEmail(values.email);

  // Passwords are never trimmed: whitespace may be part of the password.
  if (!values.password) errors.password = 'Enter your password.';
  else if (values.password.length > AUTH_LIMITS.passwordMaxLength) errors.password = 'Password is too long.';

  return stripEmpty(errors);
}

export function validateRegister(values: RegisterFormValues): FieldErrors<keyof RegisterFormValues> {
  const errors: FieldErrors<keyof RegisterFormValues> = {};

  const name = normalizeName(values.name);
  if (!name) errors.name = 'Enter your full name.';
  else if (name.length > AUTH_LIMITS.nameMaxLength)
    errors.name = `Name must be at most ${AUTH_LIMITS.nameMaxLength} characters.`;

  errors.email = validateEmail(values.email);

  if (!values.password) errors.password = 'Create a password.';
  else if (values.password.length < AUTH_LIMITS.passwordMinLength)
    errors.password = `Password must be at least ${AUTH_LIMITS.passwordMinLength} characters.`;
  else if (values.password.length > AUTH_LIMITS.passwordMaxLength)
    errors.password = `Password must be at most ${AUTH_LIMITS.passwordMaxLength} characters.`;

  if (!values.confirmPassword) errors.confirmPassword = 'Re-enter your password.';
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';

  return stripEmpty(errors);
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

function stripEmpty<Field extends string>(errors: FieldErrors<Field>): FieldErrors<Field> {
  const result: FieldErrors<Field> = {};
  for (const key of Object.keys(errors) as Field[]) {
    if (errors[key]) result[key] = errors[key];
  }
  return result;
}
