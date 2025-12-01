import { Stack } from 'expo-router';

// Layout para pantallas anidadas de `medications`.
//
// Nota: La lista principal de medicamentos se encuentra en
// `app/(tabs)/medications.tsx`. Esta carpeta contiene las pantallas
// anidadas (new, edit) que se presentan como modales o rutas de pila.
// Mantener esta separación evita mezclar la UI de la pestaña con los
// formularios/detalle, y sigue el patrón recomendado por Expo Router.
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