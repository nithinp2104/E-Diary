import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppText, CheckItem, ErrorMessage, HeroScreen } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { toApiError } from '@/lib/api/errors';
import { colors, radius, sizes, spacing } from '@/theme';

const BENEFITS = ['Access to all app sections', 'Secure employee account', 'Offline access to synced content'];

/**
 * Shown to signed-in users whose subscription is not confirmed active.
 * Payment/renewal is intentionally not implemented here.
 */
export default function SubscriptionScreen() {
  const { subscriptionStatus, refreshUser, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isExpired = subscriptionStatus === 'expired';

  const checkAgain = async () => {
    setIsChecking(true);
    setError(null);
    try {
      await refreshUser();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsChecking(false);
    }
  };

  const signOut = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <HeroScreen
      title={isExpired ? 'Subscription expired' : 'Subscription required'}
      subtitle={isExpired ? 'Renew access to continue' : 'Active access is needed to continue'}>
      <AppCard style={styles.center}>
        <View style={styles.statusIcon}>
          <AppText variant="title" color="primary">
            ◷
          </AppText>
        </View>
        <AppText variant="heading" align="center">
          {isExpired ? 'Your access has expired' : "We couldn't confirm an active subscription"}
        </AppText>
        <AppText variant="small" color="textSecondary" align="center">
          {isExpired
            ? 'Renew your subscription to unlock E-Diary.'
            : 'E-Diary content is available only with an active employee subscription.'}
        </AppText>
      </AppCard>

      <AppCard>
        <AppText variant="overline" color="textMuted">
          E-Diary access · 30 days
        </AppText>
        {BENEFITS.map((benefit) => (
          <CheckItem key={benefit} label={benefit} />
        ))}
        <ErrorMessage tone="info" message="Online subscription and renewal are not available in the app yet." />
      </AppCard>

      <ErrorMessage message={error} />

      <View style={styles.actions}>
        <AppButton title="Check again" onPress={() => void checkAgain()} loading={isChecking} disabled={isLoggingOut} />
        <AppButton variant="secondary" title="Sign out" onPress={() => void signOut()} loading={isLoggingOut} />
        <AppText variant="caption" color="textMuted" align="center">
          Your saved account and profile will remain.
        </AppText>
      </View>
    </HeroScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  statusIcon: {
    width: sizes.statusIcon,
    height: sizes.statusIcon,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
