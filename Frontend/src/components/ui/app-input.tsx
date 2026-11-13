import { useId, useState, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/theme';

import { AppText } from './app-text';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  /** Renders a Show/Hide toggle and masks the value by default. */
  isPassword?: boolean;
  ref?: Ref<TextInputInstance>;
}

export function AppInput({
  label,
  error,
  hint,
  isPassword = false,
  editable = true,
  autoCorrect,
  ref,
  onFocus,
  onBlur,
  ...rest
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const labelId = useId();

  return (
    <View style={styles.container}>
      <AppText variant="label" nativeID={labelId}>
        {label}
      </AppText>

      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          Boolean(error) && styles.fieldError,
          !editable && styles.fieldDisabled,
        ]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textDisabled}
          editable={editable}
          secureTextEntry={isPassword && isHidden}
          autoCorrect={isPassword ? false : autoCorrect}
          accessibilityLabel={label}
          accessibilityLabelledBy={labelId}
          accessibilityHint={error ?? hint}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isHidden ? 'Show password' : 'Hide password'}
            onPress={() => setIsHidden((hidden) => !hidden)}
            hitSlop={spacing.sm}
            style={styles.toggle}>
            <AppText variant="link">{isHidden ? 'Show' : 'Hide'}</AppText>
          </Pressable>
        )}
      </View>

      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.inputHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldFocused: {
    borderColor: colors.primary,
    borderWidth: sizes.borderWidthFocus,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  toggle: {
    minHeight: sizes.minTouchTarget,
    justifyContent: 'center',
    paddingLeft: spacing.md,
  },
});
