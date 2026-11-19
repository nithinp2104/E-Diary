import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, sizes, spacing } from '@/theme';

import { AppText } from './app-text';

type Variant = 'primary' | 'secondary' | 'link';

export interface AppButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ title, variant = 'primary', loading = false, disabled, style, ...rest }: AppButtonProps) {
  const isDisabled = Boolean(disabled) || loading;
  const isLink = variant === 'link';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={isLink ? spacing.sm : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && pressedStyles[variant],
        isDisabled && !isLink && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} />
      ) : (
        <AppText
          variant={isLink ? 'link' : 'bodyStrong'}
          color={variant === 'primary' ? 'onPrimary' : 'primary'}
          style={isDisabled && isLink ? styles.linkDisabled : undefined}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  primary: {
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  secondary: {
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: sizes.borderWidth,
    borderColor: colors.primarySoft,
  },
  link: {
    minHeight: sizes.minTouchTarget,
    paddingHorizontal: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
    boxShadow: undefined,
    elevation: 0,
  },
  linkDisabled: {
    color: colors.textDisabled,
  },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.infoSoft },
  link: { opacity: 0.6 },
});
