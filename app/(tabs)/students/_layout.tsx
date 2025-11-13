import { Stack } from 'expo-router';

export default function StudentsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]"
        options={{
          title: 'Detalle del Estudiante',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="new"
        options={{
          title: 'Nuevo Estudiante',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="edit"
        options={{
          title: 'Editar Estudiante',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}