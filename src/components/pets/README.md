# Mascotas (cartilla digital)

Pestaña **Mascotas** del perfil (`/perfil?tab=pets`). Cada persona registra a sus mascotas, lleva su cartilla de salud, recibe recordatorios antes de cada fecha y, si una se pierde, publica su reporte en un paso. Backend: `kadesh-back/docs/cartilla/README.md`.

## Promesa

Tener la cartilla a la mano y no olvidar una vacuna. Si se pierde, no volver a capturar nada: el reporte sale con lo que ya está en la cartilla.

## Pantallas

- **Lista** (`/perfil?tab=pets`): tarjetas con foto, especie · raza · edad, estado si no está activa y el próximo recordatorio pendiente (rojo si ya pasó, ámbar si es en 7 días o menos). Vacío con siguiente paso: **Registrar mascota**.
- **Cartilla** (`/perfil?tab=pets&pet=<id>`): el `id` va en la URL para que el enlace del recordatorio (push y correo) abra directo aquí y para que «atrás» regrese a la lista. Bloques:
  - Encabezado: foto, nombre, estado, datos (sexo, nacimiento o edad, color, peso, esterilizada, microchip, señas). Acciones: **Editar**, **Marcar como perdida** (solo si está activa), **Borrar** (solo el principal).
  - Si está perdida: aviso rojo con **Ya regresó a casa** y **Ver reporte**.
  - **Cartilla**: registros (vacuna, desparasitación interna/externa, consulta, cirugía, medicamento, otro) con fecha, veterinaria, próxima fecha, notas y fotos.
  - **Recordatorios**: pendientes y avisados arriba; hechos y cancelados en «Ver anteriores».
  - **Familia**: dueños con su rol. El principal agrega por correo y quita familiares; un familiar puede salirse. Si el correo no tiene cuenta (`PET_FAMILY_USER_NOT_FOUND`), aparece **Registrar a esta persona**: el principal escribe nombre, apellido, correo, teléfono y la contraseña de la nueva cuenta (`registerPetFamilyMember`). A la persona le llega un correo que le dice que su contraseña la tiene quien la registró; el correo no la lleva.

Las altas y ediciones se hacen en una hoja modal (`PetSheet`, mismo marco que el registro de un reporte). En móvil sube desde abajo.

## Reglas

- Solo los dueños ven una mascota. El backend filtra; la web no pide nada a nombre de otro.
- Especie y raza son los mismos catálogos que un reporte (`AnimalTypeSelector`, `AnimalBreedPicker`). La especie es obligatoria: sin ella no se puede reportar como perdida.
- Edad: fecha de nacimiento **o** edad aproximada (texto). Nunca las dos.
- Fotos: hasta 3 (las que se copian al reporte si se pierde), JPG/PNG/WEBP de 5 MB o menos; HEIC se convierte a JPG (`toUploadableImage`). Adjuntos de un registro: hasta 3.
- `Perdida` no se elige en el formulario: entra con **Marcar como perdida** (`markPetAsLost`) y sale con **Ya regresó a casa** (`markPetAsFound`, cierra el reporte como «En familia»). A mano solo Activa, Fallecida o Transferida.
- Marcar como perdida pide fecha (no futura), pin en el mapa y teléfono (10 dígitos, prellenado con el del perfil). Ese teléfono sale en el reporte público.
- Un registro con **próxima fecha** crea su recordatorio solo (3 días antes, notificación y correo). Ese recordatorio no se borra ni se le cambia la fecha desde Recordatorios: se cambia la próxima fecha del registro.
- Canales que ofrece la web: notificación (campana + push de la app) y correo. WhatsApp existe en el backend pero todavía no manda nada, así que no se ofrece; si un recordatorio ya lo trae, se conserva al guardar.
- La veterinaria de un registro es opcional y se busca en el directorio por nombre (`PetPlace` con tipo `veterinary`).

## Qué no va aquí

Los reportes de animales (pestaña Reportes y `/animales`). Las citas (pestaña Citas). La cartilla no es pública.
