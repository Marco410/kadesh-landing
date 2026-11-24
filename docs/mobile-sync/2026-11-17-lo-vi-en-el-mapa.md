---
estado: implementado
fecha: 2026-11-17
origen: kadesh-landing@feat/avistamientos-mapa
feature: animals
---

# Prompt para kadesh-pet-mobile: «Lo vi» en el mapa (últimas 72 h)

## Contexto
Depende del prompt [«Lo vi»: avistamientos sin cuenta](2026-11-13-lo-vi-avistamientos.md).

El pin de un animal perdido se queda en el último lugar que registró la familia, que a veces es de hace días. Los avisos «Lo vi» recientes dicen hacia dónde se movió, pero solo se veían entrando a la ficha. Ahora `getNearbyAnimals` devuelve, por animal, los avistamientos de las últimas 72 h, y el mapa y la lista los muestran.

## Qué implementar en la app
1. **Mapa de animales** (el que usa `getNearbyAnimals`):
   - Por cada avistamiento de `recentSightings`, dibuja un marcador **chico** (unos 22 px) con forma de círculo del color del estado del animal, borde blanco y un ojo blanco al centro. Así se distingue de los pines de reporte.
   - El primero (el más reciente) va con opacidad completa y encima. Los demás, al 60 %.
   - Dibuja una línea punteada (2 px, opacidad 0.7, color del estado) desde el pin del reporte hasta el avistamiento más reciente: indica hacia dónde va.
   - Al tocar un punto, se abre la misma tarjeta o preview del animal que al tocar su pin.
   - Los puntos y la línea no se agrupan (cluster) con los pines de reporte.
   - Etiqueta de accesibilidad del punto: «{nombre}: lo vieron {cuándo} · {lugar}».
2. **Tarjeta de la lista y preview del mapa**: si hay `recentSightings[0]`, agrega una línea en el color de la marca, con ícono de binoculares: «Lo vieron {cuándo en minúsculas} · {placeLabel o city}». Ejemplos: «Lo vieron hace 3 h · Col. Centro», «Lo vieron ayer, 9:00 a.m.».
   - «Cuándo» usa la misma regla de «Lo han visto» en la ficha:
     - «Hace 5 min» si pasaron menos de 60 min;
     - «Hace 2 h» si pasaron menos de 6 h;
     - «Hoy, 7:40 p.m.» o «Ayer, 9:00 a.m.» si fue hoy o ayer;
     - «3 nov., 6:15 p.m.» en otro caso.
3. **Mapa de la ficha del animal** (el de la ubicación del registro):
   - Dibuja también los avistamientos de `animal.sightings`, que ya llegan en la consulta de la ficha (ver el prompt de «Lo vi»). Usa solo los que tienen `hidden: false`.
   - Mismo punto con ojo que en el mapa general. El primero (el más reciente) va encima. Los demás, y cualquiera de más de 72 h, al 60 %.
   - Si el más reciente es de las últimas 72 h: línea punteada desde el pin del registro hasta él, y encuadre del mapa para ver el pin y los avistamientos de las últimas 72 h.
   - Debajo del mapa, si hay avistamientos: «Los puntos con ojo son avistamientos («Lo vi»). Ver la lista», que lleva a la sección «Lo han visto».
4. **El directorio y el mapa de animales** usan `recentSightings`. Las listas del inicio y las alertas de zona no lo piden.

## GraphQL

```graphql
query GetDirectoryAnimals($input: NearbyAnimalsInput!) {
  getNearbyAnimals(input: $input) {
    success
    message
    total
    animals {
      id
      slug
      name
      status
      lat
      lng
      # …los demás campos que ya pide la app
      recentSightings {
        id
        lat        # String
        lng        # String
        seenAt     # ISO
        placeLabel
        city
      }
    }
  }
}
```

```ts
export interface NearbyAnimalSighting {
  id: string;
  lat: string;
  lng: string;
  seenAt?: string | null;
  placeLabel?: string | null;
  city?: string | null;
}
```

## Reglas y constantes
- El back ya filtra: últimas 72 h, máximo 3 por animal, el más reciente primero, solo animales `lost` o `abandoned` y sin los avistamientos ocultos. La app no vuelve a filtrar.
- No trae contacto: el contacto solo está en la ficha, para quien atiende el reporte.
- Va en la misma petición del mapa: no hagas una consulta aparte por animal.
- Lanza esto en la app después de que el back nuevo esté publicado: antes, el campo `recentSightings` no existe.

## Referencia web
- `src/components/animals/AnimalsMap.tsx` (puntos y línea)
- `src/components/animals/detail/LogMap.tsx`, `src/components/animals/detail/LogTimeline.tsx` (mapa de la ficha)
- `src/components/shared/free-map.ts` (`createSightingDotIcon`)
- `src/components/animals/AnimalCard.tsx`, `src/components/animals/AnimalInfoWindow.tsx`
- `src/components/animals/queries.ts` (`GET_DIRECTORY_ANIMALS_QUERY`)
- Back: `kadesh-back/graphql/customs/queries/nearbyAnimals.ts` (`getRecentSightings`)

## Criterios de aceptación
- [ ] Un perdido con avistamientos recientes muestra sus puntos y la línea al más reciente.
- [ ] A las 72 h el punto deja de salir en el mapa (sigue en la ficha).
- [ ] Tocar un punto abre la tarjeta del animal.
- [ ] La tarjeta muestra «Lo vieron…» con el más reciente.
- [ ] El mapa de la ficha muestra los avistamientos visibles y la línea al más reciente de las últimas 72 h.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
