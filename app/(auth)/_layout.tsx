import { Stack, router, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { session } = useAuth();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (session && rootNavigationState?.key) {
      router.replace('/(tabs)');
    }
  }, [session, rootNavigationState?.key]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}