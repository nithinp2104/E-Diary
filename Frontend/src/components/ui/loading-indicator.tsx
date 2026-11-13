import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppText } from './app-text';

export interface LoadingIndicatorProps {
  message?: string;
  /** Covers the whole screen; used while the session is being restored. */
  fullScreen?: boolean;
}

export function LoadingIndicator({ message, fullScreen = false }: LoadingIndicatorProps) {
  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <AppText variant="small" color="textMuted" align="center">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  fullScreen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
});
