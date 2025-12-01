Carpeta `app/students`

Este directorio contiene las pantallas anidadas (detalle, creación y edición) para el recurso "students".

Estructura:
- `_layout.tsx` : Define la pila (detalle y modales) para `/students/[id]`, `/students/new`, `/students/edit`.
- `[id].tsx` : Vista de detalle del estudiante.
- `new.tsx` : Formulario para crear un estudiante.
- `edit.tsx` : Formulario para editar un estudiante.

Nota: La vista principal de listado se encuentra en `app/(tabs)/students/index.tsx`. Mantener esta separación permite que la pestaña muestre la lista mientras las acciones de detalle/edición se muestren como modales o rutas anidadas.