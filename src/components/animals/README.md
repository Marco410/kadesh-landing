# Animales

Listado, detalle y reporte de animales perdidos o en adopción. `/animales` es una **herramienta** (lista + mapa), no una landing: el mapa ocupa el resto de la pantalla y la lista es un panel.

## Promesa

Ayudar a encontrar o adoptar. El mapa y las tarjetas muestran el mismo conjunto; al tocar un pin se selecciona la ficha, y al tocar una ficha se centra el mapa.

## UI

- Sin franja azul de héroe. El H1 vive en el panel (`Animales`).
- Radio en chips (`10–50 km`).
- Filtros siempre visibles, sin cajón: **Todos / Perdido / Encontrado / En adopción** (punto del color del pin). Tipo: **Perro y Gato** al frente, con trazo; Ave, Pez, Reptil y Mamífero van en **Más**. Contorno vs relleno de marca para el seleccionado.
- Motion (GSAP, `useGSAP` + timeline): pulso `scale` al tocar un chip; Más/Menos entra/sale en stagger (`autoAlpha` + `y`). `prefers-reduced-motion` lo apaga.
- Si no hay resultados, el vacío nombra la búsqueda (`No hay reptiles rescatados en 10 km`) y ofrece ampliar radio o quitar filtros.
- Ficha de lista: foto, estatus de color semántico, distancia, Ver ficha. Oscuro: `night` / `night-raised`.
- **Reportar** está en el encabezado del panel (y sobre el mapa en móvil). Si no hay sesión, abre el modal de registro.

## Alta (`/animales/nuevo`)

Es una **herramienta de tres pasos**, no un formulario largo ni una landing. Quien llega (sobre todo con un animal perdido, desde el celular) tiene que terminar en minutos. Un solo formulario sin scroll no cabe: el mapa y las fotos se pelean el viewport. Un wizard de 7 pasos se siente a trámite.

1. **Foto y tipo** — fotos primero (es lo que reconoce a alguien): se arrastran o se eligen varias a la vez, hasta 3. Se reordenan arrastrando: la primera es la **portada** (`order: 1`) y es la que se ve en el listado y en la ficha. Tipo en chips, nombre. «No tiene nombre» va marcado si el estatus es encontrado / abandonado / rescatado.
2. **Cómo reconocerlo** — tamaño y edad en chips, color, sexo, raza y **señas particulares** (obligatorias). **No sé** busca mestizo/sin raza; si no existe, pide la más cercana.
3. **Dónde** — estatus (prellenado con `?status=`): Perdido, Encontrado, En adopción, Abandonado y Rescatado siempre visibles, sin Más. Hoy / otra fecha, mapa, teléfono (prellenado del perfil). Lat/lng y ciudad/estado/país no se muestran; el pin y la dirección bastan. Nota detrás de un enlace.

Barra de **tres círculos** (1 · 2 · 3). El paso listo muestra un check y la línea se llena con GSAP. El pie queda fijo: Atrás / Continuar, y en el último paso **Publicar reporte**. El H1 cambia con el trabajo (`Reportar perdido`, `Dar en adopción`…). Sin franja azul, sin footer del sitio. Al publicar, va a la ficha (`/animales/luna-perdido-roma-a1b2c3`). El slug lo genera Keystone (nombre o tipo, estatus, ciudad y un sufijo del id) y no cambia si editan el nombre.

El borrador se guarda en el navegador (paso, campos y fotos) por usuario. Recargar o volver más tarde retoma donde iba. Se borra al publicar.

El mapa del picker no enseña coordenadas ni nombra el proveedor. CTA de posición: **Estoy aquí**.

## Ficha (`/animales/[slug]`)

La URL canónica es el slug. Los enlaces viejos `/animales/{id}` siguen abriendo la ficha y redirigen al slug cuando existe. Si el animal aún no tiene slug, se usa el id.

Misma familia que la ficha de veterinaria: `pt-[72px]`, `night` / `night-raised`, sin franja azul y sin footer del sitio.

El trabajo es reconocer y actuar. Encabezado: volver al listado, nombre, chip de estatus (color del pin, no de marca), **Cómo llegar** y **Llamar**. La foto es el héroe de reconocimiento, sin halo de 5px; si no hay imagen, el glifo de tipo. Al lado: tipo, raza, señas y quién reportó.

Abajo, historial y mapa del registro elegido. No se muestran coordenadas ni notas placeholder (`Sin información adicional`). Cómo llegar en el mapa sigue el pin seleccionado; el del encabezado va al último registro. Quien reportó puede agregar o borrar actualizaciones. Comentarios usan el azul de marca.

## Mapa

No usamos la API de Google Maps. El mapa es **Leaflet + MapLibre GL** con el estilo Liberty de **OpenFreeMap** (`src/components/shared/free-map.ts`), empaquetado en la app (no se carga desde unpkg). El modo oscuro es un filtro CSS (`.kadesh-free-map--night`), no un segundo estilo. Pins de usuario y controles usan `--color-kadesh`.

El picker de ubicación (reporte y bitácora) busca y hace geocodificación inversa con **Nominatim** (OpenStreetMap), limitado a México. No hay Places ni API key de mapas.

## Copy

Tono directo, español de México. No nombramos Leaflet, MapLibre, Nominatim ni Google al visitante. Los colores de estatus en el pin no son la marca: «Rescatado» sigue en naranja semántico para no confundirlo con el azul KADESH.

## Acceso

`/animales` es público. `?status=` (p. ej. `in_adoption`) prefiltra el listado; el hero de portada usa eso para «Quiero adoptar».

Reportar (`/animales/nuevo`) exige sesión. Si no hay usuario, el CTA del listado abre el modal de registro; los enlaces del hero van a login/registro con `redirect` y conservan `?status=` (perdido, encontrado, en adopción). El formulario acepta también abandonado y rescatado.
