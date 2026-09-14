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

## Mapa

No usamos la API de Google Maps. El mapa es **Leaflet + MapLibre GL** con el estilo Liberty de **OpenFreeMap** (`src/components/shared/free-map.ts`), empaquetado en la app (no se carga desde unpkg). El modo oscuro es un filtro CSS (`.kadesh-free-map--night`), no un segundo estilo. Pins de usuario y controles usan `--color-kadesh`.

El picker de ubicación (reporte y bitácora) busca y hace geocodificación inversa con **Nominatim** (OpenStreetMap), limitado a México. No hay Places ni API key de mapas.

## Copy

Tono directo, español de México. No nombramos Leaflet, MapLibre, Nominatim ni Google al visitante. Los colores de estatus en el pin no son la marca: «Rescatado» sigue en naranja semántico para no confundirlo con el azul KADESH.

## Acceso

`/animales` es público. `?status=` (p. ej. `in_adoption`) prefiltra el listado; el hero de portada usa eso para «Quiero adoptar».

Reportar (`/animales/nuevo`) exige sesión. Si no hay usuario, el CTA del listado abre el modal de registro; los enlaces del hero van a login/registro con `redirect` y conservan `?status=` (perdido, encontrado, en adopción). El formulario acepta también abandonado y rescatado.
