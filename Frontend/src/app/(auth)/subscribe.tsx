import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppCard, AppText, CheckItem, Divider, HeroScreen } from '@/components/ui';
import { PAYMENT_METHODS, SUBSCRIPTION_PLAN, type PaymentMethodId } from '@/features/subscription/plan';
import { colors, radius, sizes, spacing } from '@/theme';

/** Simulated gateway delay until a real payment provider is integrated. */
const MOCK_PAYMENT_DELAY_MS = 1500;

/** Step 1 of 3: plan summary; "Subscribe" opens the payment sheet over this screen. */
export default function SubscribeScreen() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <HeroScreen
      title="Subscribe to access the app"
      subtitle="One simple plan. Unlock every E-Diary feature."
      step={{ current: 1, total: 3 }}
      footer={
        <>
          <AppButton title={`Subscribe for ${SUBSCRIPTION_PLAN.priceLabel}`} onPress={() => setIsSheetOpen(true)} />
          <AppText variant="caption" color="textMuted" align="center">
            🔒 Secure payment · PhonePe, Google Pay, any UPI app or card
          </AppText>
        </>
      }>
      <AppCard>
        <View style={styles.planHeader}>
          <AppText variant="label">{SUBSCRIPTION_PLAN.name}</AppText>
          <View style={styles.badge}>
            <AppText variant="caption" color="primary" style={styles.badgeText}>
              {SUBSCRIPTION_PLAN.durationLabel}
            </AppText>
          </View>
        </View>
        <View style={styles.priceRow}>
          <AppText variant="price" color="primary">
            {SUBSCRIPTION_PLAN.priceLabel}
          </AppText>
          <AppText variant="small" color="textMuted" style={styles.perPeriod}>
            / {SUBSCRIPTION_PLAN.durationDays} days
          </AppText>
        </View>
        <Divider />
        <View style={styles.benefits}>
          {SUBSCRIPTION_PLAN.benefits.map((benefit) => (
            <CheckItem key={benefit} label={benefit} />
          ))}
        </View>
      </AppCard>

      <PaymentSheet visible={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </HeroScreen>
  );
}

function PaymentSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<PaymentMethodId>('phonepe');
  const [isPaying, setIsPaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = () => {
    if (!isPaying) onClose();
  };

  const pay = () => {
    setIsPaying(true);
    // TODO: replace with the real payment gateway (PhonePe / Razorpay etc.) and verify on the backend.
    timer.current = setTimeout(() => {
      setIsPaying(false);
      onClose();
      router.replace('/payment-success');
    }, MOCK_PAYMENT_DELAY_MS);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={styles.flex} accessibilityLabel="Close payment" onPress={close} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHeader}>
              <View style={styles.flex}>
                <AppText variant="heading">E-Diary</AppText>
                <AppText variant="small" color="textMuted">
                  Subscription · {SUBSCRIPTION_PLAN.durationLabel}
                </AppText>
              </View>
              <AppText variant="display" color="primary">
                {SUBSCRIPTION_PLAN.priceLabel}
              </AppText>
            </View>

            <AppText variant="overline" color="textMuted">
              Pay with
            </AppText>
            <View style={styles.methods} accessibilityRole="radiogroup">
              {PAYMENT_METHODS.map((option) => {
                const selected = option.id === method;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected, disabled: isPaying }}
                    disabled={isPaying}
                    onPress={() => setMethod(option.id)}
                    style={[styles.method, selected && styles.methodSelected]}>
                    <AppText variant={selected ? 'bodyStrong' : 'body'} color={selected ? 'primary' : 'text'}>
                      {option.label}
                    </AppText>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <AppButton title={`Pay ${SUBSCRIPTION_PLAN.priceLabel}`} onPress={pay} loading={isPaying} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  badgeText: {
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  perPeriod: {
    paddingBottom: spacing.sm,
  },
  benefits: {
    gap: spacing.md,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: sizes.maxContentWidth + spacing.xl * 2,
    maxHeight: '90%',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  sheetContent: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.infoSoft,
  },
  methods: {
    gap: spacing.sm,
  },
  method: {
    minHeight: sizes.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodSelected: {
    borderColor: colors.primary,
    borderWidth: sizes.borderWidthFocus,
    backgroundColor: colors.infoSoft,
  },
  radio: {
    width: sizes.radio,
    height: sizes.radio,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: sizes.radio / 2,
    height: sizes.radio / 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
