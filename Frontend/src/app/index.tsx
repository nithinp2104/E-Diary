import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BrandBolt, BrandRing } from '@/components/brand-logo';
import { AppText, LoadingIndicator } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { colors, spacing } from '@/theme';

/** How long the welcome screen stays visible on app launch. */
const WELCOME_DURATION_MS = 5000;
const FADE_DURATION_MS = 400;
/** The bolt flies in after the ring and "Hello" have appeared. */
const BOLT_DELAY_MS = 900;
const BOLT_DURATION_MS = 900;
const LOGO_SIZE = 200;

/**
 * The welcome screen is shown once per app launch. "/" is also the fallback for guarded
 * routes (e.g. after sign-out), and those visits should forward immediately instead.
 */
let hasShownWelcome = false;

/**
 * Landing route for "/" (app launch and the bare deep link `frontend:///`).
 * On launch it shows a welcome screen for 5 seconds while the session is restored,
 * then forwards to the screen the current auth state allows.
 */
export default function Index() {
  const { status, subscriptionStatus } = useAuth();
  const [isWelcomeDone, setIsWelcomeDone] = useState(hasShownWelcome);
  // Signed-out users land on the subscribe page after the launch welcome, and on login otherwise.
  const [isFirstLaunch] = useState(!hasShownWelcome);

  useEffect(() => {
    if (isWelcomeDone) return;
    const timer = setTimeout(() => {
      hasShownWelcome = true;
      setIsWelcomeDone(true);
    }, WELCOME_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isWelcomeDone]);

  if (!isWelcomeDone) return <WelcomeScreen />;
  if (status === 'initializing') return <LoadingIndicator fullScreen />;
  if (status !== 'authenticated') return <Redirect href={isFirstLaunch ? '/subscribe' : '/login'} />;
  return <Redirect href={subscriptionStatus === 'active' ? '/home' : '/subscription'} />;
}

/**
 * Dark-blue welcome: the blue ring and "Hello" fade in first, then the red bolt
 * flies in from the right edge and lands in the ring above "Hello", completing the logo.
 */
function WelcomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [contentOpacity] = useState(() => new Animated.Value(0));
  const [boltProgress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const fadeIn = Animated.timing(contentOpacity, {
      toValue: 1,
      duration: FADE_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    const boltIn = Animated.timing(boltProgress, {
      toValue: 1,
      duration: BOLT_DURATION_MS,
      delay: BOLT_DELAY_MS - FADE_DURATION_MS,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    });
    const fadeOut = Animated.timing(contentOpacity, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      delay: WELCOME_DURATION_MS - BOLT_DELAY_MS - BOLT_DURATION_MS - FADE_DURATION_MS,
      useNativeDriver: true,
    });
    const animation = Animated.sequence([fadeIn, boltIn, fadeOut]);
    animation.start();
    return () => animation.stop();
  }, [contentOpacity, boltProgress]);

  // Start fully off-screen to the right of the logo, tilted, and land upright in place.
  const boltStyle = {
    opacity: boltProgress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
    transform: [
      {
        translateX: boltProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [(screenWidth + LOGO_SIZE) / 2, 0],
        }),
      },
      {
        translateY: boltProgress.interpolate({ inputRange: [0, 1], outputRange: [-LOGO_SIZE / 3, 0] }),
      },
      { rotate: boltProgress.interpolate({ inputRange: [0, 1], outputRange: ['25deg', '0deg'] }) },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        <View style={styles.logo} accessibilityLabel="E-Diary logo" accessibilityRole="image">
          <BrandRing size={LOGO_SIZE} />
          <Animated.View style={[StyleSheet.absoluteFill, boltStyle]}>
            <BrandBolt size={LOGO_SIZE} gapColor={colors.splashBackground} />
          </Animated.View>
        </View>
        <AppText variant="display" color="onPrimary" align="center" accessibilityRole="header">
          Hello
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.splashBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
