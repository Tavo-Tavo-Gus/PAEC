import { Stack } from 'expo-router';

export default function MedicalLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          title: 'Medicamentos',
        }}
      />
      <Stack.Screen 
        name="new"
        options={{
          title: 'Nuevo Medicamento',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="edit"
        options={{
          title: 'Editar Medicamento',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}