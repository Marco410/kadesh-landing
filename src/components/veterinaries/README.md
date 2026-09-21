# Veterinarias

Directorio de clínicas cerca del usuario. Es una **herramienta** (lista + mapa), no una landing: el mapa ocupa el resto de la pantalla y la lista es un panel.

## Promesa

Encontrar una veterinaria cercana con distancia, horario y contacto. El mapa y las fichas comparten selección: pin ↔ ficha. Tocar la ficha centra el mapa; **Ver ficha** abre `/veterinarias/{slug}` (nombre + municipio). El CUID viejo sigue abriendo la ficha y redirige al slug.

## UI

- Sin franja azul de héroe. El H1 vive en el panel. Sin pie del sitio: el split lista + mapa ocupa `100dvh` menos la barra.
- Radio en chips (`5–30 km`) con `aria-pressed`. Vive también en `?radius=` para compartir la búsqueda. Si el radio actual no tiene resultados, el vacío propone el siguiente (`Buscar en 10 km`, etc.).
- Chip **Abiertas ahora** debajo del radio. Filtra lista y mapa a `isOpen === true` (las que no tienen horario no entran). Vive en `?open=1`. El chip muestra cuántas están abiertas en el radio actual. Si ninguna lo está, el vacío ofrece **Ver todas**.
- Ficha de lista: pin de marca (el mismo del mapa), abierto/cerrado, distancia, llamar, ver ficha. Si está verificada, un check va junto al nombre. Si tiene me gusta, el corazón y el conteo van junto a las reseñas; si va en cero, no se muestra. No es el recuadro-mapa de la portada: aquí la densidad importa.
- Motion (Framer, mismos tokens que perfil en `shared/motion`): las fichas entran en cascada; radio activo desliza el fondo kadesh; vacío y lista se intercambian; toque `scale` 0.97. El modal de reserva sube con overlay. Si el sistema pide menos movimiento, no hay animación.
- Oscuro: `night` / `night-raised`, no OLED.

## Mapa

Mismo stack gratuito que animales: **Leaflet + MapLibre GL + OpenFreeMap Liberty** (`src/components/shared/free-map.ts`), empaquetado en la app. Sin API de Google Maps. Pins y acentos usan `--color-kadesh`.

El mapa pinta `allPlaces` del listado visible (incluye el filtro de abiertas); la lista pagina de a 10.

## Ficha (`/veterinarias/{slug}`)

Mientras carga, un skeleton copia encabezado, mapa, contacto, horarios, servicios y reseñas (mismo grid) para que la página no salte. En oscuro los bloques contrastan con `night`; no es un solo recuadro. Si ya hay ficha en caché, se muestra esa y no el skeleton.

En escritorio hay dos columnas iguales. A la izquierda, mapa y contacto se parten a la mitad de la primera pantalla (la columna queda fija mientras las reseñas de la derecha hacen scroll). El bloque de contacto pesa más (filas grandes, acciones Llamar / Escribir / Abrir). A la derecha: horarios, servicios y reseñas. **¿Es tu clínica?** va debajo y la página hace scroll. La URL canónica es el slug (`canefarma-farmacia-veterinaria-morelia`); si el dueño cambia el nombre, el enlace no se rompe. Identidad: nombre, tipos de negocio debajo (`Veterinaria · Refugio · Parque`, mismo copy que en perfil), **Reservar cita** (si el tipo de negocio lo admite), **Cómo llegar**, **me gusta** y llamar arriba. El like exige sesión; sin cuenta pide iniciar sesión y vuelve a la ficha. Con sesión se crea o borra el like de esa clínica. No es un guardado en perfil todavía: vive en la ficha. El backend guarda el día en español (`Lunes`, `Miércoles`…); se agrupan por horario (p. ej. «Lunes a sábado»). Las reseñas muestran las 3 más recientes; **Más reseñas** es un botón que expande el resto (y **Menos reseñas** las vuelve a plegar). En móvil el encabezado se apila, el mapa tiene altura fija (~240px) y contacto va debajo a altura natural (la página hace scroll; no se recorta dirección ni correo). Sitio y redes quedan debajo del título Contacto, en iconos, no aplastados a un lado. Si la ficha está verificada, un check de marca va pegado al nombre (ficha, directorio y portada).

Contacto muestra dirección, teléfono, WhatsApp y correo en filas (el texto se envuelve; no se corta con puntos). Sitio y redes no van en esa lista: son iconos-enlace. En escritorio van a la derecha del título; en móvil, debajo. Las redes salen de `SocialMedia` (`pet_place_social_media`); teléfono, WhatsApp, sitio y correo viven en PetPlace. Chips de urgencias / cita / estacionamiento si aplican.

## Citas (lado cliente)

La ficha pública ofrece **Reservar cita** (o **Agendar estancia** en hotel/guardería) solo si `types` incluye un valor con agenda: `veterinary`, `pet_shelter`, `pet_park`, `other` (cita puntual) o `pet_boarding` (rango de fechas). `pet_store` o sin types útiles no muestran el CTA. El formulario es un **modal en la ficha** (`?reservar=1` lo abre, p. ej. al volver del login). Un `/veterinarias/{slug}/reservar` viejo redirige ahí. Sin sesión va a login y regresa con el modal abierto.

Un solo modelo (`startsAt` / `endsAt`). La cita puntual muestra los próximos 7 días (se envuelven en el teléfono) y **Otra** abre el mes en el formulario, no el picker nativo. La hora va debajo. Duración 1 hora por defecto. La estancia usa entrada/salida (14:00 / 12:00). Servicio y notas son opcionales. Nombre, tipo y raza son los mismos controles del reporte de animal (chips, sugerir nombre, raza con **No sé**); `petSpecies` se guarda como texto (`Perro — Labrador`). No se manda `customer` ni `status`: el backend asigna al usuario en sesión y nace en **Pendiente**. Después del envío se dice claro que el negocio aún no confirma; el correo de confirmación o cancelación lo manda el backend.

**Mis citas** está en `/perfil?tab=appointments` (también en el menú de cuenta). Etiquetas: Pendiente, Confirmada, Cancelada, Completada, No se presentó. Cancelar solo si está pendiente o confirmada. No hay control de disponibilidad en esta versión: no se valida doble reserva en el cliente.

## Reclamo

Debajo del lienzo mapa + horarios: **¿Es tu clínica?** El mapa no cede altura. Lista qué puede completar el dueño (horarios, WhatsApp, correo, redes, dirección, sitio, cita y estacionamiento). Sin sesión → login con `redirect` a la ficha. Con sesión → rol, teléfono y cómo comprobarlo; la solicitud queda en revisión y se abre WhatsApp con los mismos datos. Si otro ya la pidió: **Ficha en revisión** + **Escribir por WhatsApp**. El botón fijo de WhatsApp de la esquina es de KADESH (dudas y errores de la plataforma), no de la clínica. No decimos el nombre del mapa ni del backend. La edición vive en `/perfil?tab=clinics`, no en una ruta nueva. El dueño verificado ve «Esta ficha es tuya». Ahí administra datos, tipo de negocio (varios, nunca vacío), horarios, servicios del catálogo (o pide uno nuevo a revisión) y el calendario de citas, donde puede agendar y dar de alta pacientes.

## Copy

Nunca decimos «Google Maps», «Leaflet» ni el nombre del tile server. Si el usuario niega la ubicación, pedimos activarla en el navegador — sin emojis.

## Acceso

Público. El radio filtra el listado GraphQL. **Abiertas ahora** se aplica en cliente sobre `isOpen`. Reclamar exige sesión; editar la ficha, además, que un admin la haya verificado. Reservar cita exige sesión.
