import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/brand-logo';
import { colors, radius, sizes, spacing } from '@/theme';

import { AppText } from './app-text';

export interface HeroScreenProps {
  title: string;
  subtitle?: string;
  /** Onboarding progress, rendered as a pill and a segmented bar. */
  step?: { current: number; total: number };
  onBack?: () => void;
  /** Pinned to the bottom of the screen (primary actions). */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Standard E-Diary screen: a blue header band (logo, step, title) with the white
 * content cards overlapping its lower edge. Scrolls and avoids the keyboard.
 */
export function HeroScreen({ title, subtitle, step, onBack, footer, children }: HeroScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, !footer && { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
            <View style={[styles.decor, styles.decorLarge]} />
            <View style={[styles.decor, styles.decorSmall]} />

            <View style={styles.heroInner}>
              <View style={styles.topRow}>
                <View style={styles.brand}>
                  {onBack ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go back"
                      onPress={onBack}
                      hitSlop={spacing.sm}
                      style={({ pressed }) => [styles.iconTile, styles.backTile, pressed && styles.pressed]}>
                      <AppText variant="title" color="onPrimary">
                        ‹
                      </AppText>
                    </Pressable>
                  ) : (
                    <View style={styles.iconTile} accessibilityLabel="E-Diary logo" accessibilityRole="image">
                      <BrandLogo size={sizes.brandMark - spacing.sm} gapColor={colors.surface} />
                    </View>
                  )}
                  <AppText variant="heading" color="onPrimary">
                    E-Diary
                  </AppText>
                </View>
                {step ? (
                  <View style={styles.stepPill}>
                    <AppText variant="caption" color="onPrimary" style={styles.stepText}>
                      Step {step.current} of {step.total}
                    </AppText>
                  </View>
                ) : null}
              </View>

              {step ? (
                <View style={styles.progress} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {Array.from({ length: step.total }, (_, index) => (
                    <View
                      key={index}
                      style={[styles.progressSegment, index < step.current && styles.progressSegmentActive]}
                    />
                  ))}
                </View>
              ) : null}

              <View style={styles.titles}>
                <AppText variant="hero" color="onPrimary" accessibilityRole="header">
                  {title}
                </AppText>
                {subtitle ? (
                  <AppText variant="body" color="onPrimaryMuted">
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.content}>{children}</View>
        </ScrollView>

        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.footerInner}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const OVERLAP = spacing.huge;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: colors.hero,
    borderBottomLeftRadius: radius.xl + spacing.sm,
    borderBottomRightRadius: radius.xl + spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: OVERLAP + spacing.xxl,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    borderRadius: radius.pill,
    backgroundColor: colors.heroDecor,
  },
  decorLarge: {
    width: 260,
    height: 260,
    top: -90,
    right: -80,
  },
  decorSmall: {
    width: 140,
    height: 140,
    bottom: -40,
    left: -50,
  },
  heroInner: {
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconTile: {
    width: sizes.brandMark,
    height: sizes.brandMark,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTile: {
    backgroundColor: colors.heroDecor,
  },
  pressed: {
    opacity: 0.7,
  },
  stepPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.heroDecor,
    borderWidth: sizes.borderWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  stepText: {
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  progress: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressSegmentActive: {
    backgroundColor: colors.surface,
  },
  titles: {
    gap: spacing.sm,
  },
  content: {
    width: '100%',
    maxWidth: sizes.maxContentWidth + spacing.xl * 2,
    alignSelf: 'center',
    marginTop: -OVERLAP,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: sizes.borderWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  footerInner: {
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.sm,
  },
});
