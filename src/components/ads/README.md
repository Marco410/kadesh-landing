# Anuncios (Kadesh Pet web)

La tarjeta «Publicidad» del detalle de animal, el detalle de veterinaria, el blog y la tienda.
Los anuncios se crean en Operaciones (kadesh-business → Kadesh Pet → Anuncios). Las reglas
están en kadesh-back `models/Pet/Ad/README.md`.

## Cómo llegan

- `WithAds` (server) pide `activeAds` una vez y la deja en la caché de datos de Next 5 min
  (`ADS_REVALIDATE_SECONDS`), por debajo de la hora que duran las URLs firmadas de las imágenes.
  Solo la usan los layouts de `animales/[slug]`, `veterinarias/[slug]`, `blog` y
  `StoreListingPage`: el resto del sitio no se regenera por los anuncios.
- `AdsProvider` comparte la lista con todos los `AdSlot` de la página. Las visitas nunca le piden
  anuncios al back.

## Qué anuncio sale (`pick.ts`)

1. Los que tienen el lugar de la pantalla (`placement`: `animal_detail`, `vet_detail`, `blog`, `store`).
2. Nunca el anuncio de lo que se está viendo (`context.targetId`: el animal o la veterinaria).
3. Los de zona solo dentro de su radio, medido desde:
   - la ubicación del animal o la veterinaria en su ficha (`context.lat/lng`);
   - en blog y tienda, la ciudad aproximada de quien visita: `/api/visitor-location` la toma de
     Cloudflare por IP. Se pide una vez al día por navegador (localStorage) y solo si algún anuncio
     de zona podría salir ahí. Nunca se pide el GPS.
   - Sin punto de referencia, solo salen los nacionales.
4. Hasta 4 rotando cada 10 s, barajados por peso; uno de zona que coincide pesa el doble. Los de
   Kadesh (`house`) solo salen si no aplica ninguno pagado. Sin ninguno, el hueco no se pinta.

## Medición (`track.ts`)

- Impresión: la tarjeta visible queda al menos a la mitad en pantalla 1 s con la pestaña abierta.
  Una por anuncio y lugar en cada vista de página.
- Clic: al tocar la tarjeta. Se manda en ese momento con `keepalive`.
- Las impresiones van en lote cada 10 s, al ocultar la pestaña o al salir (`recordAdEvents`). Sin
  eventos no se manda nada. El back descarta repeticiones de 30 min, admins y buscadores.
- Los enlaces de fuera llevan `utm_source=kadesh_pet&utm_medium=ad`.

## AdSense

El script y `/ads.txt` siguen en el layout raíz (`core/ads.ts`), pero ya no se pide ningún bloque
de AdSense: el hueco muestra solo anuncios de Operaciones.
