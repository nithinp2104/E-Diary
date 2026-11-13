import { useState } from 'react';

import type { UserProfile } from '../types/auth.types';
import { mapRegisterError } from '../utils/auth-errors';
import {
  hasErrors,
  normalizeEmail,
  normalizeName,
  validateRegister,
  type FieldErrors,
  type RegisterFormValues,
} from '../validation/auth.validation';
import { useAuth } from './use-auth';

type Field = keyof RegisterFormValues;

const EMPTY: RegisterFormValues = { name: '', email: '', password: '', confirmPassword: '' };

export function useRegisterForm(onRegistered: (user: UserProfile) => void) {
  const { register } = useAuth();
  const [values, setValues] = useState<RegisterFormValues>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (formError) setFormError(null);
  };

  const submit = async () => {
    if (isSubmitting) return;

    const errors = validateRegister(values);
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    try {
      // Exactly the backend RegisterDto: { name, email, password }.
      const user = await register({
        name: normalizeName(values.name),
        email: normalizeEmail(values.email),
        password: values.password,
      });
      setValues(EMPTY);
      onRegistered(user);
    } catch (error) {
      const mapped = mapRegisterError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, fieldErrors, formError, isSubmitting, setField, submit };
}
