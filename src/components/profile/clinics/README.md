# Administrar clínica (`clinics/`)

Panel que se abre en `/perfil?tab=clinics` cuando la ficha ya está verificada. No es una ruta nueva.

## Promesa

Que el dueño entienda qué está editando: la pestaña de arriba **es** el recuadro de abajo. Horarios en un renglón. Servicios se buscan, no se recorren. Citas con hoy marcado y pacientes propios.

## UI

Un solo recuadro: barra de pestañas (fondo gris) + panel (fondo del recuadro, “Estás viendo …”). La pestaña activa comparte el fondo del contenido y tiene subrayado kadesh que se desliza al cambiar. El contenido del recuadro entra y sale; **Administrar** abre el panel con altura; días del calendario y botones responden al toque.

- **Datos**: tipo de negocio con casillas, no chips de pestaña. Los valores son los de `TYPES_PET_PLACE` (`veterinary`, `pet_shelter`, `pet_park`…). Si uno no estaba en el catálogo de BD, el backend lo crea al guardar. En la ficha pública (`/veterinarias/{slug}`) esos tipos se muestran bajo el nombre, con el mismo copy (`Veterinaria · Refugio · Parque`).
- **Horarios**: lista compacta, casilla + abre/cierra en la misma fila.
- **Servicios**: chips de lo marcado, buscador, lista corta. Pedir uno nuevo → pendiente hasta que un admin lo apruebe (correo a `SMTP_ADMIN_NOTIFICATION_EMAILS`). Copy alineado con `src/components/veterinaries/README.md` y el README de perfil.
- **Citas**: hoy en ámbar; seleccionado en kadesh; **Ir a hoy**. **Agregar cita** no es un formulario de selects: se toca el paciente, la hora (del horario de ese día) y la duración. Mascota y notas van plegadas. **Cerrar** no es un botón azul. Abajo, lista de pacientes (crea `User` ligado a ese PetPlace).

## Qué nunca decimos

Keystone, GraphQL, catálogo interno, “pending/approved”. Sí: “lo revisamos”, “en revisión”, “ficha pública”.
