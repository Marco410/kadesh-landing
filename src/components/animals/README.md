# Animales

Listado, detalle y reporte de animales perdidos o en adopción. El visitante ve fichas cerca de su ubicación y puede reportar uno nuevo si está autenticado.

## Promesa

Ayudar a encontrar o adoptar. El mapa y las tarjetas muestran el mismo conjunto; al tocar un pin se selecciona la ficha, y al tocar una ficha se centra el mapa.

## Mapa

No usamos la API de Google Maps. El mapa es **Leaflet + MapLibre GL** con el estilo Liberty de **OpenFreeMap** (`src/components/shared/free-map.ts`), empaquetado en la app (no se carga desde unpkg). El modo oscuro es un filtro CSS (`.kadesh-free-map--night`), no un segundo estilo. Pins de usuario y controles usan `--color-kadesh`.

El picker de ubicación (reporte y bitácora) busca y hace geocodificación inversa con **Nominatim** (OpenStreetMap), limitado a México. No hay Places ni API key de mapas.

## Copy

Tono directo, español de México. No nombramos Leaflet, MapLibre, Nominatim ni Google al visitante. Los colores de estatus en el pin no son la marca: «Rescatado» sigue en naranja semántico para no confundirlo con el azul KADESH.

## Acceso

`/animales` es público. `?status=` (p. ej. `in_adoption`) prefiltra el listado; el hero de portada usa eso para «Quiero adoptar».

Reportar (`/animales/nuevo`) exige sesión. Si no hay usuario, el CTA del listado abre el modal de registro; los enlaces del hero van a login/registro con `redirect` y conservan `?status=` (perdido, encontrado, en adopción). El formulario acepta también abandonado y rescatado.
