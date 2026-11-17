---
estado: pendiente
fecha: 2026-11-17
origen: kadesh-landing@feat/avistamientos-mapa
feature: animals
---

# Prompt para kadesh-pet-mobile: animales paginados en el servidor y mapa con pines ligeros

## Contexto
`getNearbyAnimals` traía todos los animales y sus bitácoras a memoria en cada llamada, sin importar el `limit`. Ahora filtra, ordena y pagina en la base: el costo depende de lo que devuelve. Además hay una consulta nueva, `getNearbyAnimalPins`, pensada para el mapa: devuelve todos los pines del filtro (hasta 1000), con una sola foto y sin autor.

La API vieja sigue funcionando igual. Una versión instalada de la app no se rompe, pero si pide cientos de animales para paginar en el teléfono sigue siendo cara para el back. Este prompt la ajusta.

Cambios de comportamiento del back que la app debe conocer:
- `limit` de `getNearbyAnimals` tiene tope de 500.
- `lat: null` / `lng: null` ahora se tratan como «sin ubicación» y devuelven los más recientes. Antes no devolvían nada.
- Entre animales a la misma distancia (redondeada a 0.01 km), el orden puede variar un poco. Ahora se ordena por la distancia exacta.

## Qué implementar en la app
1. **Lista de animales** (directorio): pide **una página por petición** con `limit` (tarjetas por página, por ejemplo 20) y `skip = (página - 1) * limit`. Usa `total` para saber si hay más (scroll infinito o paginación). No pidas cientos para paginar en el teléfono.
2. **Mapa de animales**: usa `getNearbyAnimalPins` con los **mismos filtros** que la lista (lat, lng, radius, animalType, status), sin `limit` ni `skip` (el back los ignora). No lo vuelvas a pedir al cambiar de página en la lista, solo al cambiar filtros o ubicación. La tarjeta o preview del pin usa los campos del pin: `name`, `typeName`, `breedName`, `coverUrl`, `distance`, el lugar y `createdAt`.
3. Si `total` de los pines es mayor que los pines devueltos (más de 1000), el mapa no muestra todos. Por ahora no hace falta avisarlo.
4. Nombre a mostrar: `animalDisplayName({ name, typeName, sex })` (ver el prompt [nombre desconocido](2026-11-13-nombre-desconocido.md)).

## GraphQL

```graphql
# Lista (una página)
query GetDirectoryAnimals($input: NearbyAnimalsInput!) {
  getNearbyAnimals(input: $input) {
    total
    animals {
      id slug name sex distance status lat lng address city state country createdAt
      animal_type { id name }
      animal_breed { id breed }
      multimedia { id url order }
      recentSightings { id lat lng seenAt placeLabel city }
    }
  }
}
# input: { lat?, lng?, radius?, animalType?, status?, limit: 20, skip: (página - 1) * 20 }

# Mapa (todos los pines del filtro, hasta 1000)
query GetAnimalPins($input: NearbyAnimalsInput!) {
  getNearbyAnimalPins(input: $input) {
    total
    animals {
      id slug name sex status lat lng distance
      typeName breedName
      address city state country createdAt
      coverUrl
      recentSightings { id lat lng seenAt placeLabel city }
    }
  }
}
# input: { lat?, lng?, radius?, animalType?, status? }
```

```ts
export interface NearbyAnimalPin {
  id: string;
  slug?: string | null;
  name: string;            // vacío si no se sabe: usa animalDisplayName
  sex?: string | null;
  status: string;
  lat: string;
  lng: string;
  distance: number | null; // km; null sin ubicación
  typeName?: string | null;  // 'dog', 'cat'…
  breedName?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string;       // "MM/DD/YYYY, hh:mm:ss AM/PM" en UTC (formato histórico)
  coverUrl?: string | null; // URL firmada: caduca en 1 h; la llave de caché es el id
  recentSightings?: Array<{ id: string; lat: string; lng: string; seenAt?: string | null; placeLabel?: string | null; city?: string | null }>;
}
```

## Reglas y constantes
- Sin ubicación, omite `lat`/`lng`. Los dos filtros devuelven los más recientes primero; con ubicación, del más cercano al más lejano.
- Las URLs de foto son firmadas y caducan en 1 h: la llave de caché de la imagen es el `id` del animal, nunca la URL.
- Lista y mapa son dos peticiones al entrar; al cambiar de página solo se repite la de la lista.

## Referencia web
- `src/components/animals/hooks/useLostAnimals.ts`
- `src/components/animals/queries.ts` (`GET_DIRECTORY_ANIMALS_QUERY`, `GET_ANIMAL_PINS_QUERY`)
- Back: `kadesh-back/graphql/customs/queries/nearbyAnimals.ts`, `kadesh-back/utils/pet/nearbyAnimalsSql.ts`

## Criterios de aceptación
- [ ] La lista pide una página por vez (`limit` pequeño) y avanza con `skip`.
- [ ] El mapa usa `getNearbyAnimalPins` y no se repite al cambiar de página.
- [ ] Con filtro de estado o tipo, lista y mapa muestran lo mismo.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
