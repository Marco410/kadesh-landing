# Administrar clínica (`clinics/`)

Vista propia dentro de Clínicas: `/perfil?tab=clinics&clinic=<id>&vista=datos|horarios|servicios|citas` (`Routes.profileClinic(id, vista)`). Solo se abre cuando la ficha ya está verificada; si no, se ve la lista. No es una ruta nueva y el enlace de siempre (`?tab=clinics&clinic=<id>`) abre directo aquí.

## Promesa

Que el dueño entienda qué está editando: el segmentado de arriba elige la tarjeta de abajo y la tarjeta dice qué edita. Horarios en un renglón. Servicios se buscan, no se recorren. Citas con hoy marcado y pacientes propios.

## UI

Panel con sesión (2026-11):

- Encabezado con "← Clínicas", el nombre de la clínica como título, su ubicación y "Ver ficha pública".
- Las migas terminan en la clínica (`useProfileDetailCrumb`).
- Debajo, `DashSegmented` (Datos / Horarios / Servicios / Citas) y una `DashSectionCard` con el título y la pista de la sección.
- Cambiar de sección reemplaza `&vista=` sin mover el foco. Abrir la clínica sí lo lleva al título.
- Campos y chips salen de `formStyles.ts`, alineado con el kit del panel. La opción elegida va en tinta, no en azul.

Antes era "un solo recuadro" que se desplegaba dentro de la lista. Ya no: el calendario necesitaba todo el ancho.

- **Datos**: tipo de negocio con casillas, no chips de pestaña. Los valores son los de `TYPES_PET_PLACE` (`veterinary`, `pet_shelter`, `pet_park`…). Si uno no estaba en el catálogo de BD, el backend lo crea al guardar. En la ficha pública (`/veterinarias/{slug}`) esos tipos se muestran bajo el nombre, con el mismo copy (`Veterinaria · Refugio · Parque`).
- **Horarios**: lista compacta, casilla + abre/cierra en la misma fila.
- **Servicios**: chips de lo marcado, buscador, lista corta. Pedir uno nuevo → pendiente hasta que un admin lo apruebe (correo a `SMTP_ADMIN_NOTIFICATION_EMAILS`). Copy alineado con `src/components/veterinaries/README.md` y el README de perfil.
- **Citas**: hoy en ámbar; el día elegido en tinta; **Ir a hoy**. Las acciones de cada cita (Confirmar…) van en tinta, no en azul. Cancelar abre un `DashModal` con motivo opcional. **Agregar cita** no es un formulario de selects: se toca el paciente, la hora (del horario de ese día) y la duración. Mascota y notas van plegadas. **Cerrar** no es un botón azul. Abajo, lista de pacientes (crea `User` ligado a ese PetPlace).

## Qué nunca decimos

Keystone, GraphQL, catálogo interno, “pending/approved”. Sí: “lo revisamos”, “en revisión”, “ficha pública”.
