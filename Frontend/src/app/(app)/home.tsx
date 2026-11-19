import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppText, Divider, HeroScreen, InfoRow } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { colors, radius, sizes, spacing } from '@/theme';

/** Protected entry point. E-Diary content sections are out of scope for the auth integration. */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'E';

  const signOut = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <HeroScreen title={`Hello, ${user?.name ?? 'there'}`} subtitle="Organization at a glance">
      <AppCard>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <AppText variant="title" color="onPrimary">
              {initial}
            </AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="heading">{user?.name}</AppText>
            <AppText variant="small" color="textSecondary">
              {user?.email}
            </AppText>
          </View>
        </View>
        <Divider />
        <InfoRow label="Subscription" value="Active" />
      </AppCard>

      <AppButton variant="secondary" title="Sign out" onPress={() => void signOut()} loading={isLoggingOut} />
    </HeroScreen>
  );
}

const AVATAR_SIZE = 52;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizes.borderWidthFocus * 2,
    borderColor: colors.primarySoft,
  },
});
