import { Tabs } from 'expo-router';
import { Users, ClipboardList, Calendar, Pill } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { router, useRootNavigationState } from 'expo-router';

export default function TabLayout() {
  const { session } = useAuth();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!session && rootNavigationState?.key) {
      router.replace('/sign-in');
    }
  }, [session, rootNavigationState?.key]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Estudiantes',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
          headerShown: true,
          headerTitle: 'Lista de Estudiantes',
        }}
      />
      <Tabs.Screen
        name="support-plans"
        options={{
          title: 'Planes',
          tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} />,
          headerShown: true,
          headerTitle: 'Planes de Acompañamiento',
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medicamentos',
          tabBarIcon: ({ size, color }) => <Pill size={size} color={color} />,
          headerShown: true,
          headerTitle: 'Medicamentos',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
          headerShown: true,
          headerTitle: 'Calendario',
        }}
      />
    </Tabs>
  );
}