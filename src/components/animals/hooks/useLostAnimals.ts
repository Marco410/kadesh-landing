"use client";

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANIMAL_PINS_QUERY, GET_DIRECTORY_ANIMALS_QUERY, GET_ANIMAL_TYPES_QUERY } from '../queries';
import { LostAnimal, AnimalFilters, AnimalType } from '../types';
import { DEFAULT_ANIMALS_PER_PAGE, DEFAULT_RADIUS } from 'kadesh/constants/constans';
import { sortMultimediaByOrder } from '../sortMultimedia';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import { animalDisplayName } from 'kadesh/components/animals/animalName';


/** Filtros de `NearbyAnimalsInput`: lat/lng/radio solo si hay ubicación. */
interface NearbyAnimalsFilterInput {
  lat?: number;
  lng?: number;
  radius?: number;
  animalType?: string;
  status?: string;
  location?: string;
}

interface NearbyAnimal {
  id: string;
  slug?: string | null;
  name: string;
  distance: number | null;
  sex: string;
  lat: string;
  lng: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  animal_breed: {
    id: string;
    breed: string;
  } | null;
  animal_type: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  multimedia: Array<{
    id: string;
    url: string;
    order?: number | null;
  }>;
  /** «Lo vi» de las últimas 72 h (máx. 3, el más reciente primero). */
  recentSightings?: Array<{
    id: string;
    lat: string;
    lng: string;
    seenAt?: string | null;
    placeLabel?: string | null;
    city?: string | null;
  }> | null;
}

/** Pin del mapa (`getNearbyAnimalPins`): lo que pinta el pin y su ventanita. */
interface NearbyAnimalPin {
  id: string;
  slug?: string | null;
  name: string;
  sex?: string | null;
  status: string;
  lat: string;
  lng: string;
  distance: number | null;
  typeName?: string | null;
  breedName?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: string;
  coverUrl?: string | null;
  recentSightings?: NearbyAnimal['recentSightings'];
}

const TYPE_TO_SPANISH: Record<string, AnimalType> = {
  dog: 'perro',
  cat: 'gato',
  rabbit: 'conejo',
  bird: 'ave',
};

/** Tipo de la base (`dog`) al de la web (`perro`); filtro de tipo en el sentido contrario. */
const TYPE_TO_DB: Record<string, string> = {
  perro: 'dog',
  gato: 'cat',
  ave: 'bird',
  conejo: 'rabbit',
  otro: 'other',
};

function locationText(animal: { address: string | null; city: string | null; state: string | null; country: string | null; lat: string; lng: string }) {
  const parts = [animal.address, animal.city, animal.state, animal.country].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return animal.lat && animal.lng ? `${animal.lat}, ${animal.lng}` : 'Ubicación no disponible';
}

function transformSightings(sightings: NearbyAnimal['recentSightings']) {
  return (sightings ?? [])
    .map((sighting) => ({
      id: sighting.id,
      latitude: Number.parseFloat(sighting.lat),
      longitude: Number.parseFloat(sighting.lng),
      seenAt: sighting.seenAt ?? null,
      place: sighting.placeLabel || sighting.city || null,
    }))
    .filter((sighting) => Number.isFinite(sighting.latitude) && Number.isFinite(sighting.longitude));
}

function coordinate(value: string) {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : undefined;
}

function transformPin(pin: NearbyAnimalPin): LostAnimal {
  const typeName = pin.typeName?.toLowerCase() || '';
  return {
    id: pin.id,
    slug: pin.slug,
    name: animalDisplayName({ name: pin.name, typeName: pin.typeName, sex: pin.sex }),
    type: TYPE_TO_SPANISH[typeName] || (typeName as AnimalType) || 'otro',
    breed: pin.breedName || '',
    status: pin.status,
    location: locationText(pin),
    latitude: coordinate(pin.lat),
    longitude: coordinate(pin.lng),
    distance: pin.distance || 0.01,
    image: pin.coverUrl ? { url: pin.coverUrl } : undefined,
    description: '',
    createdAt: pin.createdAt,
    isFavorite: false,
    recentSightings: transformSightings(pin.recentSightings),
  };
}

function transformAnimal(animal: NearbyAnimal): LostAnimal {
  const image = sortMultimediaByOrder(animal.multimedia)?.[0];
  const typeName = animal.animal_type?.name?.toLowerCase() || '';
  const mappedType = TYPE_TO_SPANISH[typeName] || (typeName as AnimalType) || 'otro';

  return {
    id: animal.id,
    slug: animal.slug,
    // Sin nombre conocido: «Perra café» (ver `animalName.ts`). También es lo que busca el filtro por nombre.
    name: animalDisplayName({ name: animal.name, typeName: animal.animal_type?.name, sex: animal.sex }),
    type: mappedType,
    breed: animal.animal_breed?.breed || '',
    status: animal.status,
    location: locationText(animal),
    latitude: coordinate(animal.lat),
    longitude: coordinate(animal.lng),
    distance: animal.distance || 0.01,
    image: image ? { url: image.url } : undefined,
    description: '',
    createdAt: animal.createdAt,
    isFavorite: false,
    recentSightings: transformSightings(animal.recentSightings),
  };
}

/**
 * Directorio `/animales`: dos consultas, ambas paginadas o topadas en el back.
 * - Lista: `getNearbyAnimals` con `limit`/`skip` de la página actual (con fotos). Cambiar de página
 *   pide solo esa página.
 * - Mapa: `getNearbyAnimalPins` con los mismos filtros, sin página: todos los pines del filtro
 *   (hasta 1000) con una foto de portada. No se vuelve a pedir al cambiar de página.
 * Filtros de la pantalla: estado y tipo (y el radio). Todo se filtra en el back.
 */
export function useLostAnimals(
  initialFilters?: AnimalFilters,
  animalsPerPage?: number,
  userLocation?: { lat: number | null; lng: number | null },
  radiusKm?: number
) {
  const ANIMALS_PER_PAGE = animalsPerPage || DEFAULT_ANIMALS_PER_PAGE;
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AnimalFilters>(initialFilters || {});

  useEffect(() => {
    setCurrentPage(1);
  }, [radiusKm]);

  // Catálogo de tipos: el filtro manda el id del tipo, no el nombre.
  const { data: animalTypesData } = useQuery(GET_ANIMAL_TYPES_QUERY, {
    variables: { orderBy: [{ order: "asc" }] },
    // Catálogo que casi no cambia: con lo que hay en caché basta.
    fetchPolicy: 'cache-first',
  });

  const lat = userLocation?.lat ?? null;
  const lng = userLocation?.lng ?? null;

  const typeId = useMemo(() => {
    if (!filters.type) return null;
    const dbTypeName = TYPE_TO_DB[filters.type] || filters.type;
    const match = (animalTypesData?.animalTypes as Array<{ id: string; name?: string | null }> | undefined)?.find(
      (type) => type.name?.toLowerCase() === dbTypeName.toLowerCase()
    );
    return match?.id ?? null;
  }, [filters.type, animalTypesData]);
  // Con filtro de tipo, se espera al catálogo para no pedir primero todo y luego lo filtrado.
  const waitingForTypes = Boolean(filters.type) && !animalTypesData;

  const filterInput = useMemo(() => {
    const input: NearbyAnimalsFilterInput = {};
    // Solo con las dos coordenadas: sin ellas el back devuelve todo, del más nuevo al más viejo.
    if (lat != null && lng != null) {
      input.lat = lat;
      input.lng = lng;
      input.radius = radiusKm ?? DEFAULT_RADIUS;
    }
    if (typeId) input.animalType = typeId;
    if (filters.status) input.status = filters.status;
    if (filters.location) input.location = filters.location;
    return input;
  }, [lat, lng, radiusKm, typeId, filters.status, filters.location]);

  const listQuery = useQuery(GET_DIRECTORY_ANIMALS_QUERY, {
    variables: {
      input: { ...filterInput, limit: ANIMALS_PER_PAGE, skip: (currentPage - 1) * ANIMALS_PER_PAGE },
    },
    skip: waitingForTypes,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', // Return partial data even if there are errors
  });
  const pinsQuery = useQuery(GET_ANIMAL_PINS_QUERY, {
    variables: { input: filterInput },
    skip: waitingForTypes,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  // Al cambiar filtros, radio o página se queda lo anterior (atenuado en la UI) hasta que llega lo nuevo.
  const listData = listQuery.data ?? listQuery.previousData;
  const pinsData = pinsQuery.data ?? pinsQuery.previousData;

  const animals = useMemo(
    () => ((listData?.getNearbyAnimals?.animals ?? []) as NearbyAnimal[]).map(transformAnimal),
    [listData]
  );

  const allAnimals = useMemo(
    () => ((pinsData?.getNearbyAnimalPins?.animals ?? []) as NearbyAnimalPin[]).map(transformPin),
    [pinsData]
  );

  const totalAnimals: number = listData?.getNearbyAnimals?.total ?? 0;
  const totalPages = Math.ceil(totalAnimals / ANIMALS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const updateFilters = (newFilters: Partial<AnimalFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const error = listQuery.error ?? pinsQuery.error;

  return {
    animals,
    allAnimals, // Pines del mapa
    loading: listQuery.loading || waitingForTypes,
    error: error ? friendlyErrorText(error, 'No se pudieron cargar los reportes. Intenta de nuevo.') : null,
    currentPage,
    totalPages,
    totalAnimals,
    goToPage,
    nextPage,
    previousPage,
    updateFilters,
    clearFilters,
    filters,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
