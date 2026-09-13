# Veterinarias

Directorio de lugares de mascotas cerca del usuario. Lista + mapa en la misma pantalla; el detalle vive en `/veterinarias/[id]`.

## Promesa

Encontrar una veterinaria cercana con distancia, horario y contacto. El mapa y las tarjetas comparten selección: pin ↔ ficha.

## Mapa

Mismo stack gratuito que animales: **Leaflet + MapLibre GL + OpenFreeMap Liberty** (`src/components/shared/free-map.ts`), empaquetado en la app. Sin API de Google Maps. Pins y acentos usan `--color-kadesh`.

## Copy

Nunca decimos «Google Maps», «Leaflet» ni el nombre del tile server. Si el usuario niega la ubicación, pedimos activarla en el navegador — sin emojis.

## Acceso

Público. El radio (km) filtra el listado GraphQL; el mapa pinta `allPlaces` del mismo query para no perder pines de otras páginas.
