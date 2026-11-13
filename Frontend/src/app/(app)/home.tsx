import { useState } from 'react';

import { AppButton, AppCard, AppHeader, AppText, ScreenContainer } from '@/components/ui';
import { useAuth } from '@/features/auth';

/** Protected entry point. E-Diary content sections are out of scope for the auth integration. */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <ScreenContainer>
      <AppHeader title="E-Diary" subtitle="Organization at a glance" />
      <AppCard>
        <AppText variant="heading">Welcome, {user?.name}</AppText>
        <AppText variant="small" color="textSecondary">
          {user?.email}
        </AppText>
      </AppCard>
      <AppButton variant="secondary" title="Sign out" onPress={() => void signOut()} loading={isLoggingOut} />
    </ScreenContainer>
  );
}
