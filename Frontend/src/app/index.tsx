import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth';

/**
 * Landing route for "/" (app launch and the bare deep link `frontend:///`).
 * It holds no content; it only forwards to the screen the current auth state allows.
 * While the session is being restored, the root layout shows a loading overlay.
 */
export default function Index() {
  const { status, subscriptionStatus } = useAuth();

  if (status === 'initializing') return null;
  if (status !== 'authenticated') return <Redirect href="/login" />;
  return <Redirect href={subscriptionStatus === 'active' ? '/home' : '/subscription'} />;
}
