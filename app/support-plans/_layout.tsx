import { Stack } from 'expo-router';

// Layout para las pantallas anidadas de `support-plans`.
//
// Nota: La lista principal de planes se encuentra en
// `app/(tabs)/support-plans.tsx`. Aquí están las rutas de detalle y
// los modales (`[id]`, `new`, `edit`) que se muestran como pantallas
// anidadas en una pila. Mantener esta separación facilita la navegación
// y sigue el patrón recomendado por Expo Router.
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