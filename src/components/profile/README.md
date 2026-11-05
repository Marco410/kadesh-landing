# Perfil

Cuenta de quien ya tiene sesión: datos, sus mascotas con su cartilla, publicaciones del blog, los reportes de animales que publicó, las citas que reservó y las clínicas que reclamó.

## Promesa

Editar lo que sí se puede cambiar (nombre, teléfono, foto) y ver la actividad propia. No es un CRM ni una landing.

## UI

- **Panel con sesión** (2026-11). `/perfil` y `/notificaciones` no usan la barra ni el pie del sitio: viven en `ProfileShell` (`profile/shell/`), montado una vez en `app/(cuenta)/layout.tsx`, sobre `kadesh/components/app-shell` (ver su README).
- **Menú** (`profile/shell/profileNav.ts`):
  - **Mi cuenta**: Inicio, Datos del perfil, Notificaciones, Alertas de zona.
  - **Mis animales**: Mascotas, Citas, Reportes.
  - **Mis publicaciones**: Publicaciones.
  - **Mis veterinarias**: Clínicas, visible para todos como antes.
  - **Kadesh**: Veterinarias ↗, Animales ↗, Novedades ↗ (sitio público).
- **Globos** (`ProfileNavCounts`, cada minuto):
  - Notificaciones: las no leídas.
  - Mascotas: recordatorios pendientes o avisados que vencen en los próximos 7 días, incluidos los ya vencidos.
  - Citas: las que reservó, pendientes o confirmadas, desde ahora.
  - Clínicas: citas por confirmar en sus clínicas.
- **Vistas en `?tab=`**: sin `tab`, o con uno desconocido como el viejo `?tab=ventas`, abre **Inicio**. Las demás claves son `profile` (Datos), `pets`, `posts`, `animals`, `appointments` y `clinics`, y los enlaces de siempre siguen funcionando. Rutas: `Routes.profileTab(tab)`, `Routes.profileClinic(id)` y `Routes.profilePet(id)`.
- **Cada vista**: encabezado con eyebrow (el grupo; en Inicio, la fecha), título y descripción. Todo sale de `PROFILE_VIEWS`.
  - La vista se remonta al cambiar, así su entrada se repite, y el foco pasa a su `h1`.
  - Las migas son "Perfil › grupo › vista", más el detalle si lo hay (`useProfileDetailCrumb`).
- **Sesión**: la exige el shell. Sin usuario manda a login y vuelve a la misma vista, con su query.
- **Mascotas** es la cartilla digital; vive en `src/components/pets/` (ver su README). Con `&pet=<id>` abre la cartilla de una mascota; cambiar de pestaña lo quita.
- Vacío con siguiente paso: Mascotas invita a registrar una; Reportes invita a publicar; Publicaciones manda al blog; Citas manda al directorio para reservar; Clínicas manda al directorio para reclamar una ficha.
- No hay vistas de “próximamente” (donaciones, refugios) ni **Ventas**.
- Correo y usuario no se editan aquí: se manda a **contacto**. Edad no se muestra: sale de la fecha de nacimiento.
- Al guardar: nombre y apellido paterno obligatorios. Teléfono obligatorio, 10 dígitos (espacios y guiones se quitan); Keystone no acepta `null` en ese campo. Fecha de nacimiento opcional, no posterior a hoy.

## Inicio

`profile/home/`. Las reglas viven en `homeModel.ts`, sin React, porque las comparte el prompt de móvil (`docs/mobile-sync/2026-11-03-inicio-perfil.md`).

- **Saludo**:
  - "{Buenos días…}, {nombre}." y una frase con lo que tiene (mascotas, citas próximas, reportes activos).
  - Cierra con "N cosas necesitan atención." (rojo) o "Todo en orden." (verde).
  - **Los próximos 7 días** (`WeekStrip`, reglas en `weekAgenda.ts`): fichas de hoy y los 6 días siguientes con puntitos (azul = citas, verde = sus eventos, morado = eventos cerca) y la lista del día elegido. «Cerca» usa el centro de sus alertas de zona, si no la ubicación ya compartida, si no todo México.
  - Abajo, cinco atajos: mascotas, buscar veterinaria, alertas de zona, eventos y reportar animal (en móvil, el último ocupa la fila completa).
- **Requiere atención**, de lo más urgente a lo menos:
  1. Recordatorios vencidos (rojo) o de los próximos 7 días (ámbar).
  2. Citas por confirmar en sus clínicas.
  3. Su próxima cita, si es en menos de 48 h.
  4. Reclamos de sus reportes que Kadesh revisa.
  5. Clínicas en revisión.
  6. Teléfono faltante.
  7. Alertas de zona apagadas. Es una sugerencia: no cuenta en la frase.

  Muestra 5 y luego "Ver N más".
- **KPIs**:
  - Mascotas (oscuro), Próximas citas (tintado), Reportes activos y Sin leer.
  - "Reportes activos" cuenta por el **último** estado del reporte (`lost`, `found`, `abandoned`, `rescued`, `in_adoption`), nunca por "alguna vez estuvo perdido".
  - "Sin leer" lleva la pastilla de cambio y la sparkline de lo recibido en ventanas de 7 días. Si no hay historial, no hay pastilla: no se inventa un porcentaje.
- **Mi veterinaria**: solo con una clínica administrable. Muestra hoy, por confirmar, pacientes y barras de citas por semana de calendario (la semana en curso rayada).
- **Qué no hacer**:
  - No agregar una librería de gráficas: el worker tiene tope de 10 MB.
  - No pedir la fila de la clínica a quien no tiene una verificada (`ProfileClinicHome` va aparte y se salta).
  - No quitar el filtro explícito por usuario de las consultas: un admin de plataforma vería las de todos.

## Estilo del panel (barrido 2026-11)

- Las vistas usan los tokens `dash-*`. Los hex sueltos con su pareja `dark:` se migraron con un codemod. Solo quedan los colores de estatus (rojo, verde, ámbar) y el azul de marca.
- **Tarjetas**: 24 px con `shadow-dash`; las filas compactas, 20 px con lift al pasar.
- **Botones**:
  - El degradado azul solo va en la acción principal de cada vista o formulario.
  - Las acciones de fila (Administrar, Validar, Confirmar) van en tinta.
  - Los secundarios llevan contorno neutro.
- **Movimiento**: `profile/motion.ts` ya no reexporta el del sitio. Usa la curva del panel (`DASH_EASE`, 0.55 s, escalón de 50 ms con tope de 8). Las mascotas también.
- **Modales de la cartilla** (`pets/PetSheet.tsx`) y los de cancelar cita van sobre `DashModal`.
- **`ConfirmModal`** (compartido) usa `DashModal` cuando está dentro del panel (`useInDash`). En el sitio se ve igual que antes.
- **Selectores del alta de animales** que se reutilizan en la cartilla (`animals/nuevo/*`):
  - Toman los neutros del panel porque `.kd-dash` y `.kd-dash-portal` redefinen `--color-night…`.
  - `ChoiceChip` pone la opción elegida en tinta solo dentro del panel.
- **No migrado** (sigue con su estilo de sitio dentro de la cartilla): los hex sueltos de `PhotoPicker`, `LocationPicker`, `AnimalTypeSelector`, `AnimalBreedPicker` y `Autocomplete`. Son del flujo público `/animales/nuevo`; para migrarlos hay que hacerlo con `useInDash`, sin cambiar el sitio.

## Citas

Son las que el usuario reservó como cliente, no las de la clínica que administra. El copy de estados vive alineado con la ficha (`Pendiente` no es confirmada). Cancelar pide confirmación y un motivo opcional; solo aparece si la cita está pendiente o confirmada. El flujo de reserva y las reglas de types están documentados en `src/components/veterinaries/README.md`.

## Clínicas

Solo aparecen las que el usuario reclamó. **En revisión**: no se editan; se reenvía WhatsApp. **Verificada**: **Administrar** abre su propia vista (`Routes.profileClinic(id)`) con Datos, Horarios, Servicios y Citas en un segmentado (`&vista=`). Ver `clinics/README.md`.

- **Datos**: nombre, descripción, **tipo de negocio** (casillas, varios; nunca vacío), teléfono, WhatsApp, correo, sitio, redes, dirección, urgencias, estacionamiento y cita. Las redes se reemplazan en `SocialMedia`. Cambiar el nombre no cambia la URL pública.
- La subnavegación Datos / Horarios / Servicios / Citas es un `DashSegmented` sobre una tarjeta con el título y la pista de la sección (antes era un recuadro desplegable dentro de la lista).
- **Horarios**: un renglón por día (casilla + abre/cierra). Los días apagados no salen en la ficha pública.
- **Servicios**: buscador + chips de lo marcado. El catálogo (`PetPlaceService` aprobado) no se recorre entero. Si no está, **Pedir este servicio** lo manda a revisión; el admin recibe correo y solo al aprobarlo aparece en el catálogo (y se liga a esa clínica). Los pendientes se listan como “En revisión”.
- **Citas**: calendario de _esta_ clínica. Hoy va en ámbar (distinto al día seleccionado, que es kadesh). **Ir a hoy** vuelve al día actual. En un día de hoy o futuro, **Agregar cita** elige paciente, hora y duración tocando chips (no un select nativo); mascota y notas van plegadas. La cita nace confirmada. Abajo, **Pacientes**: dar de alta crea un `User` (o liga uno existente por correo) y lo relaciona a ese PetPlace. Confirmar/cancelar las que llegan del público sigue igual; el cliente recibe correo.

El copy de reclamo vive también en la ficha pública; beneficios y tono deben coincidir.

## Ventas

El CRM de ventas (`/perfil/ventas`) redirige a `/perfil`. Quien llegue con `?tab=ventas` cae en Inicio. No se migró al panel ni a sus tokens.

## Acceso

Exige sesión. Si no hay usuario, va a login y vuelve a la misma vista (`/perfil` o `/perfil?tab=appointments`, etc.). La guarda vive en `ProfileShell`, no en cada página.
