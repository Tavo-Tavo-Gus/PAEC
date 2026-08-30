import { Tabs, router, useRootNavigationState } from 'expo-router';
import { Users, Calendar, Pill } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  const { session } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!session && rootNavigationState?.key) {
      router.replace('/sign-in');
    }
  }, [session, rootNavigationState?.key]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Estudiantes',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medicamentos',
          tabBarIcon: ({ size, color }) => <Pill size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}