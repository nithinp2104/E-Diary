import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes, spacing } from '@/theme';

import { AppText } from './app-text';

const CHECK_SIZE = 22;

/** "✓ Benefit" row with a soft blue check badge. */
export function CheckItem({ label }: { label: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkBadge}>
        <AppText variant="caption" color="primary" style={styles.checkMark}>
          ✓
        </AppText>
      </View>
      <AppText variant="body" color="textSecondary" style={styles.flexText}>
        {label}
      </AppText>
    </View>
  );
}

/** "Label ........ Value" row for summaries and receipts. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="small" color="textMuted">
        {label}
      </AppText>
      <AppText variant="label" style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkBadge: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontWeight: '700',
  },
  flexText: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: sizes.borderWidth,
    backgroundColor: colors.border,
  },
});
