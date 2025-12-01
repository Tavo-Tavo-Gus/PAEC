Carpeta `app/support-plans`

Este directorio contiene las pantallas anidadas (detalle, creación y edición) para el recurso "support-plans".

Estructura:
- `_layout.tsx` : Define la pila (detalle y modales) para `/support-plans/[id]`, `/support-plans/new`, `/support-plans/edit`.
- `[id].tsx` : Vista de detalle del plan.
- `new.tsx` : Formulario para crear un plan.
- `edit.tsx` : Formulario para editar un plan.

Nota: La vista principal de listado se encuentra en `app/(tabs)/support-plans.tsx`. Mantener esta separación facilita la navegación con Expo Router.