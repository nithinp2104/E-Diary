import { StyleSheet, View, type ViewProps } from 'react-native';

import { cardStyle, spacing } from '@/theme';

export function AppCard({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    gap: spacing.lg,
  },
});
