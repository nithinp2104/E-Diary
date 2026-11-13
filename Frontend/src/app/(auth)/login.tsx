import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import {
  AppButton,
  AppCard,
  AppHeader,
  AppInput,
  AppText,
  BrandMark,
  ErrorMessage,
  ScreenContainer,
} from '@/components/ui';
import { useAuth, useLoginForm } from '@/features/auth';
import { spacing } from '@/theme';

const PASSWORD_RESET_UNAVAILABLE =
  'Password reset is not available in the app yet. Please contact your administrator.';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ registered?: string }>();
  const { notice, clearNotice, restoreSession } = useAuth();
  const { values, fieldErrors, formError, isSubmitting, setField, submit } = useLoginForm();
  const [info, setInfo] = useState<{ tone: 'info' | 'success'; message: string } | null>(
    params.registered === '1' ? { tone: 'success', message: 'Account created. Sign in to continue.' } : null,
  );
  const passwordRef = useRef<TextInputInstance>(null);

  const handleSubmit = () => {
    clearNotice();
    setInfo(null);
    void submit();
  };

  return (
    <ScreenContainer>
      <AppHeader title="Welcome back" subtitle="Sign in to open your E-Diary" />

      <AppCard>
        <BrandMark />
        <View style={styles.intro}>
          <AppText variant="heading">Good to see you</AppText>
          <AppText variant="small" color="textSecondary">
            Use the account linked to your active employee subscription.
          </AppText>
        </View>

        {notice?.type === 'session-expired' && (
          <ErrorMessage tone="info" message="Your session has expired. Please sign in again." />
        )}
        {notice?.type === 'restore-failed' && (
          <ErrorMessage
            message={`We couldn't restore your session. ${notice.message}`}
            actionLabel="Try again"
            onAction={() => void restoreSession()}
          />
        )}
        <ErrorMessage tone={info?.tone} message={info?.message} />
        <ErrorMessage message={formError} />

        <AppInput
          label="Email address"
          placeholder="employee@organization.gov.in"
          value={values.email}
          onChangeText={(text) => setField('email', text)}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!isSubmitting}
        />

        <AppInput
          ref={passwordRef}
          label="Password"
          placeholder="Enter your password"
          value={values.password}
          onChangeText={(text) => setField('password', text)}
          error={fieldErrors.password}
          isPassword
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          editable={!isSubmitting}
        />

        <AppButton
          variant="link"
          title="Forgot password?"
          style={styles.forgot}
          onPress={() => setInfo({ tone: 'info', message: PASSWORD_RESET_UNAVAILABLE })}
          disabled={isSubmitting}
        />

        <AppButton title="Login" onPress={handleSubmit} loading={isSubmitting} />
      </AppCard>

      <View style={styles.footer}>
        <AppText variant="small" color="textSecondary">
          New employee?
        </AppText>
        <AppButton
          variant="link"
          title="Create account"
          onPress={() => router.replace('/register')}
          disabled={isSubmitting}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.xs,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
