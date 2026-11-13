import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes, spacing } from '@/theme';

import { AppButton } from './app-button';
import { AppText } from './app-text';

type Tone = 'error' | 'info' | 'success';

export interface ErrorMessageProps {
  message: string | null | undefined;
  tone?: Tone;
  actionLabel?: string;
  onAction?: () => void;
}

/** Inline banner for form-level errors and notices. Renders nothing without a message. */
export function ErrorMessage({ message, tone = 'error', actionLabel, onAction }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View
      style={[styles.container, toneStyles[tone]]}
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite">
      <AppText variant="small" color={tone === 'error' ? 'danger' : tone === 'success' ? 'success' : 'primary'}>
        {message}
      </AppText>
      {actionLabel && onAction ? <AppButton variant="link" title={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
  },
  action: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
});

const toneStyles = StyleSheet.create({
  error: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder },
  info: { backgroundColor: colors.infoSoft, borderColor: colors.infoBorder },
  success: { backgroundColor: colors.successSoft, borderColor: colors.successBorder },
});
