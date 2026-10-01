# Animales

Listado, detalle y reporte de animales perdidos o en adopción. `/animales` es una **herramienta** (lista + mapa), no una landing: el mapa ocupa el resto de la pantalla y la lista es un panel.

## Promesa

Ayudar a encontrar o adoptar. El mapa y las tarjetas muestran el mismo conjunto; al tocar un pin se selecciona la ficha, y al tocar una ficha se centra el mapa.

## UI

- Sin franja azul de héroe. El H1 vive en el panel (`Animales`). Sin pie del sitio: el split lista + mapa ocupa `100dvh` menos la barra.
- Radio en chips (`10–50 km`) con `aria-pressed`, también en `?radius=`.
- Filtros siempre visibles, sin cajón: **Todos / Perdido / Encontrado / En adopción** (punto del color del pin). Tipo: **Perro y Gato** al frente, con trazo; Ave, Pez, Reptil y Mamífero van en **Más**. Contorno vs relleno de marca para el seleccionado.
- Motion: chips de filtro siguen en GSAP (`useChipPulse`, Más/Menos). El directorio y las fichas usan Framer (`shared/motion`, misma curva que perfil): lista en cascada, radio con píldora que se desliza, vacío/carga se revelan, toque 0.97. El alta mantiene el desliz del paso en GSAP; Atrás/Continuar y la nota responden al toque. `prefers-reduced-motion` lo apaga.
- Si no hay resultados, el vacío nombra la búsqueda (`No hay reptiles rescatados en 10 km`) y ofrece ampliar radio o quitar filtros.
- Ficha de lista: foto, estatus de color semántico, distancia, Ver ficha. Oscuro: `night` / `night-raised`.
- **Reportar** está en el encabezado del panel (y sobre el mapa en móvil). Si no hay sesión, abre el modal de registro.
- La ubicación **no** se solicita sola la primera vez. El listado arranca sin coords (todos los reportes) y el panel ofrece **Usar mi ubicación** / **Reintentar**. Si ya la aprobaron, al recargar se reutiliza y el mapa muestra el pin. Centrar el mapa también guarda esa aprobación.

## Alta (`/animales/nuevo`)

Es una **herramienta de tres pasos**, no un formulario largo ni una landing. Quien llega (sobre todo con un animal perdido, desde el celular) tiene que terminar en minutos. Un solo formulario sin scroll no cabe: el mapa y las fotos se pelean el viewport. Un wizard de 7 pasos se siente a trámite.

1. **Foto y tipo** — fotos primero (es lo que reconoce a alguien): se arrastran o se eligen varias a la vez, hasta 3. Se reordenan arrastrando: la primera es la **portada** (`order: 1`) y es la que se ve en el listado y en la ficha. Tipo en chips, nombre. «No tiene nombre» va marcado si el estatus es encontrado / abandonado / rescatado.
2. **Cómo reconocerlo** — tamaño y edad en chips, color, sexo, raza y **señas particulares** (obligatorias). **No sé** busca mestizo/sin raza; si no existe, pide la más cercana. Tipo, nombre y raza (con **No sé**) se reutilizan en el modal de reservar cita; el copy y el control deben coincidir.
3. **Dónde** — estatus (prellenado con `?status=`): Perdido, Encontrado, En adopción, Abandonado y Rescatado siempre visibles, sin Más. **Hoy / Ayer / Otra fecha**. Otra fecha es solo el día; la hora es opcional y, si no va, se guarda a las 12:00. No hay fechas futuras. El mapa abre en la ubicación ya concedida o, si no hay, en Morelia. La búsqueda prioriza esa zona, muestra hasta 5 resultados en México y, si el texto trae una ciudad (`Las Margaritas, Morelia`), esa ciudad va primero. **¿Es tu mascota?** Si la respuesta es no, el teléfono queda vacío y se pide el del dueño; hay un segundo teléfono opcional. El enlace de la publicación original es opcional. Si ya existe el mismo enlace, o el mismo teléfono con tipo y nombre parecido en 30 días, se avisa y se puede publicar igual.

Lat/lng, estado y país no se muestran. La ciudad del mapa es el municipio, no la colonia. Si quien reporta editó la dirección, el título y el slug usan ese texto; la colonia del mapa queda solo como dato interno y no pisa la dirección ya escrita. Sin ciudad, el pin igual se publica: el servidor la completa.

Si quien reporta no es el dueño, la ficha dice «Reportado por la comunidad. Contacta directamente al dueño.» y, si hay enlace, «Ver publicación original».

Barra de **tres círculos** (1 · 2 · 3). El paso listo muestra un check y la línea se llena con GSAP. El pie queda fijo: Atrás / Continuar, y en el último paso **Publicar reporte**. El H1 cambia con el trabajo (`Reportar perdido`, `Dar en adopción`…). Sin franja azul, sin footer del sitio. Al publicar, va a la ficha. El slug usa el lugar que escribió quien reporta; si no editó la dirección, usa la ciudad (el municipio), nunca la colonia que resolvió el mapa.

El borrador se guarda en el navegador (paso, campos y fotos) por usuario. Recargar o volver más tarde retoma donde iba. Se borra al publicar.

El mapa del picker no enseña coordenadas ni nombra el proveedor. CTA de posición: **Estoy aquí**.

## Ficha (`/animales/[slug]`)

La URL canónica es el slug. Los enlaces viejos `/animales/{id}` siguen abriendo la ficha y redirigen al slug cuando existe. Si el animal aún no tiene slug, se usa el id.

Misma familia que la ficha de veterinaria: `pt-[72px]`, `night` / `night-raised`, sin franja azul y sin footer del sitio.

El trabajo es reconocer y actuar **sin recorrer la página**. En escritorio la ficha es un workspace de viewport: foto a la izquierda (llena la altura), datos compactos arriba a la derecha, historial y mapa abajo a la derecha. Encabezado: volver, nombre, chip de estatus, **Cómo llegar** y **Llamar**. La foto es el héroe de reconocimiento, sin halo de 5px; las miniaturas van encima de la foto. No se muestran coordenadas ni notas placeholder (`Sin información adicional`). Cómo llegar en el mapa sigue el pin seleccionado; el del encabezado va al último registro. Comentarios quedan debajo; no empujan el mapa fuera de pantalla.

El dueño del reporte (`animal.user`) puede venir `null` para visitantes sin sesión: Keystone filtra el User. La ficha **no debe crashear** — muestra «Usuario de KADESH» y oculta Editar / acciones de dueño. No asumas `user` en el render.

## Mapa

No usamos la API de Google Maps. El mapa es **Leaflet + MapLibre GL** con el estilo Liberty de **OpenFreeMap** (`src/components/shared/free-map.ts`), empaquetado en la app (no se carga desde unpkg). El modo oscuro es un filtro CSS (`.kadesh-free-map--night`), no un segundo estilo. Pins de usuario y controles usan `--color-kadesh`.

El picker de ubicación (reporte y bitácora) busca y hace geocodificación inversa con **Nominatim** (OpenStreetMap), limitado a México. No hay Places ni API key de mapas.

## Copy

Tono directo, español de México. No nombramos Leaflet, MapLibre, Nominatim ni Google al visitante. Los colores de estatus en el pin no son la marca: «Rescatado» sigue en naranja semántico para no confundirlo con el azul KADESH.

## Acceso

`/animales` es público. `?status=` (p. ej. `in_adoption`) prefiltra el listado; el hero de portada usa eso para «Quiero adoptar».

Reportar (`/animales/nuevo`) exige sesión. Si no hay usuario, el CTA del listado abre el modal de registro; los enlaces del hero van a login/registro con `redirect` y conservan `?status=` (perdido, encontrado, en adopción). El formulario acepta también abandonado y rescatado.
