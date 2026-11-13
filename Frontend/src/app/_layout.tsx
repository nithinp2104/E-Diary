import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { LoadingIndicator } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

/** "/" is always reachable; guarded screens fall back to it and it redirects by auth state. */
export const unstable_settings = {
  anchor: 'index',
};

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Route access is derived from server-verified auth state only:
 * - index         always available; redirects to the right screen below
 * - (auth)        signed out
 * - subscription  signed in, subscription not confirmed active
 * - (app)         signed in with an active subscription
 * Stack.Protected redirects away from any screen whose guard is false, which also
 * blocks direct navigation (deep links) to protected routes.
 */
function RootNavigator() {
  const { status, subscriptionStatus } = useAuth();
  const isInitializing = status === 'initializing';
  const isAuthenticated = status === 'authenticated';
  const hasAccess = isAuthenticated && subscriptionStatus === 'active';

  useEffect(() => {
    if (!isInitializing) void SplashScreen.hideAsync();
  }, [isInitializing]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={hasAccess}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated && !hasAccess}>
          <Stack.Screen name="subscription" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {/* Covers the auth screens while a stored session is restored (no flash of login). */}
      {isInitializing && <LoadingIndicator fullScreen />}
    </>
  );
}
