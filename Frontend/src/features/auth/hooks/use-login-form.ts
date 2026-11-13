import { useState } from 'react';

import { mapLoginError } from '../utils/auth-errors';
import {
  hasErrors,
  normalizeEmail,
  validateLogin,
  type FieldErrors,
  type LoginFormValues,
} from '../validation/auth.validation';
import { useAuth } from './use-auth';

type Field = keyof LoginFormValues;

export function useLoginForm() {
  const { login } = useAuth();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
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

    const errors = validateLogin(values);
    setFieldErrors(errors);
    setFormError(null);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    try {
      await login({ email: normalizeEmail(values.email), password: values.password });
      // Navigation is driven by auth state in the root layout.
    } catch (error) {
      const mapped = mapLoginError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      setValues((current) => ({ ...current, password: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, fieldErrors, formError, isSubmitting, setField, submit };
}
