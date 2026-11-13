import { Pressable, StyleSheet, View } from 'react-native';

import { colors, sizes, spacing } from '@/theme';

import { AppText } from './app-text';

export interface AppHeaderProps {
  title: string;
  /** Secondary line, e.g. "STEP 1 OF 3 · Set up your employee account". */
  subtitle?: string;
  /** Renders the "‹" back affordance used in the design. */
  onBack?: () => void;
}

export function AppHeader({ title, subtitle, onBack }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={spacing.sm}
            style={styles.back}>
            <AppText variant="title" color="primary">
              ‹
            </AppText>
          </Pressable>
        )}
        <AppText variant="title" accessibilityRole="header" style={styles.title}>
          {title}
        </AppText>
      </View>
      {subtitle ? (
        <AppText variant="small" color="textMuted">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

/** "▣ E-Diary" brand row used at the top of auth cards, with an optional trailing element. */
export function BrandMark({ trailing }: { trailing?: string }) {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <AppText variant="label" color="onPrimary">
            E
          </AppText>
        </View>
        <AppText variant="heading">E-Diary</AppText>
      </View>
      {trailing ? (
        <AppText variant="label" color="textMuted">
          {trailing}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  back: {
    minWidth: sizes.minTouchTarget / 2,
  },
  title: {
    flexShrink: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    width: sizes.brandMark,
    height: sizes.brandMark,
    borderRadius: sizes.brandMark / 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
