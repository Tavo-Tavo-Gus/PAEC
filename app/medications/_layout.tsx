import { Stack } from 'expo-router';

export default function MedicationsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="new"
        options={{
          title: 'Nuevo Medicamento',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="edit"
        options={{
          title: 'Editar Medicamento',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}