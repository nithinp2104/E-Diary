import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

type TextColor = 'text' | 'textSecondary' | 'textMuted' | 'primary' | 'onPrimary' | 'onPrimaryMuted' | 'danger' | 'success';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', color, align, style, ...rest }: AppTextProps) {
  const resolvedColor = color ?? (variant === 'link' ? 'primary' : 'text');
  return (
    <Text
      style={[typography[variant], { color: colors[resolvedColor] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
