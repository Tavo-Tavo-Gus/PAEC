import { Stack } from 'expo-router';

export default function PlansLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          title: 'Planes de Acompañamiento',
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          title: 'Detalle del Plan',
        }}
      />
      <Stack.Screen 
        name="new"
        options={{
          title: 'Nuevo Plan de Apoyo',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="edit"
        options={{
          title: 'Editar Plan de Apoyo',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}