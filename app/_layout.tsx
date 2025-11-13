import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/components/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ApiErrorBoundary } from '@/components/ApiErrorBoundary';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <ApiErrorBoundary>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ApiErrorBoundary>
    </ErrorBoundary>
  );
}