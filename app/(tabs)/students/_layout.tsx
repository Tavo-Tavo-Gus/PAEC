import { Stack } from 'expo-router';

// Layout para pantallas anidadas de `students` usadas desde la pestaña.
//
// Nota: La lista principal se encuentra en `app/(tabs)/students/index.tsx`.
// Este `_layout.tsx` define las pantallas anidadas (`[id]`, `new`, `edit`)
// que se presentan como modales o pantallas de detalle en una pila.
// Mantenerlas separadas ayuda a la organización y evita mezclar la
// lógica de la lista con los formularios/detalle.
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