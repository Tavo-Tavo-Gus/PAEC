import { Stack } from 'expo-router';

export default function SupportPlansLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]"
        options={{
          title: 'Detalle del Plan',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="new"
        options={{
          title: 'Nuevo Plan de Apoyo',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="edit"
        options={{
          title: 'Editar Plan de Apoyo',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}