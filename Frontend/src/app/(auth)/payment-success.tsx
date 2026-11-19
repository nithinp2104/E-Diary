import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppText, Divider, HeroScreen, InfoRow } from '@/components/ui';
import { SUBSCRIPTION_PLAN } from '@/features/subscription/plan';
import { colors, radius, sizes, spacing } from '@/theme';

/** Step 2 of 3: payment confirmation, then on to registration. */
export default function PaymentSuccessScreen() {
  return (
    <HeroScreen
      title="Payment successful"
      subtitle="You're almost there. Create your account to start using E-Diary."
      step={{ current: 2, total: 3 }}
      footer={<AppButton title="Go to Register" onPress={() => router.replace('/register')} />}>
      <AppCard style={styles.center}>
        <View style={styles.iconRing} accessibilityLabel="Payment successful" accessibilityRole="image">
          <View style={styles.iconCore}>
            <AppText variant="display" color="onPrimary">
              ✓
            </AppText>
          </View>
        </View>
        <View style={styles.message}>
          <AppText variant="heading" align="center">
            Subscription active
          </AppText>
          <AppText variant="small" color="textSecondary" align="center">
            Your subscription of {SUBSCRIPTION_PLAN.priceLabel} is active. Please register to continue.
          </AppText>
        </View>
      </AppCard>

      <AppCard style={styles.receipt}>
        <AppText variant="overline" color="textMuted">
          Receipt
        </AppText>
        <InfoRow label="Amount paid" value={SUBSCRIPTION_PLAN.priceLabel} />
        <Divider />
        <InfoRow label="Plan" value={`${SUBSCRIPTION_PLAN.name}, ${SUBSCRIPTION_PLAN.durationLabel}`} />
      </AppCard>
    </HeroScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  iconRing: {
    width: sizes.successIcon,
    height: sizes.successIcon,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCore: {
    width: sizes.successIcon - spacing.xxl,
    height: sizes.successIcon - spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    gap: spacing.xs,
  },
  receipt: {
    gap: spacing.sm,
  },
});
