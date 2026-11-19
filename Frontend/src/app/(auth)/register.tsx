import { router } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { AppButton, AppCard, AppInput, AppText, ErrorMessage, HeroScreen } from '@/components/ui';
import { useRegisterForm } from '@/features/auth';
import { AUTH_LIMITS } from '@/features/auth/constants';
import { spacing } from '@/theme';

export default function RegisterScreen() {
  const { values, fieldErrors, formError, isSubmitting, setField, submit } = useRegisterForm(() => {
    // Registration only creates the account; it issues no session and activates no subscription.
    router.replace({ pathname: '/login', params: { registered: '1' } });
  });
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const handleSubmit = () => void submit();

  return (
    <HeroScreen
      title="Create your account"
      subtitle="Set up your employee account"
      step={{ current: 3, total: 3 }}>
      <AppCard>
        <View style={styles.intro}>
        </View>

        <ErrorMessage message={formError} />

        <AppInput
          label="Full Name"
          placeholder="Enter your full Name"
          value={values.name}
          onChangeText={(text) => setField('name', text)}
          error={fieldErrors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={AUTH_LIMITS.nameMaxLength}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!isSubmitting}
        />

        <AppInput
          ref={emailRef}
          label="Email Address"
          placeholder="name@gmail.com"
          value={values.email}
          onChangeText={(text) => setField('email', text)}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          maxLength={AUTH_LIMITS.emailMaxLength}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!isSubmitting}
        />

        <AppInput
          ref={passwordRef}
          label="Password"
          placeholder="Create a password"
          hint={`At least ${AUTH_LIMITS.passwordMinLength} characters.`}
          value={values.password}
          onChangeText={(text) => setField('password', text)}
          error={fieldErrors.password}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={AUTH_LIMITS.passwordMaxLength}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!isSubmitting}
        />

        <AppInput
          ref={confirmRef}
          label="Confirm password"
          placeholder="Re-enter your password"
          value={values.confirmPassword}
          onChangeText={(text) => setField('confirmPassword', text)}
          error={fieldErrors.confirmPassword}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={AUTH_LIMITS.passwordMaxLength}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!isSubmitting}
        />

        <AppButton title="Continue" onPress={handleSubmit} loading={isSubmitting} />
      </AppCard>

      <View style={styles.footer}>
        <AppText variant="small" color="textSecondary">
          Already registered?
        </AppText>
        <AppButton variant="link" title="Login" onPress={() => router.replace('/login')} disabled={isSubmitting} />
      </View>
    </HeroScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
