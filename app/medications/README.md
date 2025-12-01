Carpeta `app/medications`

Este directorio contiene las pantallas anidadas (detalle, creación y edición) para el recurso "medications".

Estructura:
- `_layout.tsx` : Define la pila (modales) para `/medications/new` y `/medications/edit`.
- `new.tsx` : Formulario para crear un medicamento.
- `edit.tsx` : Formulario para editar un medicamento.

Nota: La vista principal de listado se encuentra en `app/(tabs)/medications.tsx`. Mantener esta separación permite que la pestaña muestre la lista mientras las acciones de detalle/edición se abran como modales o rutas anidadas.