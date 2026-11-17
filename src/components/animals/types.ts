export type AnimalType = 'perro' | 'gato' | 'conejo' | 'ave' | 'otro';

export interface LostAnimal {
  id: string;
  slug?: string | null;
  name: string;
  type: AnimalType;
  breed?: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  distance?: number | null;
  image?: {
    url: string;
  };
  description?: string;
  createdAt: string;
  updatedAt?: string;
  contactPhone?: string;
  contactEmail?: string;
  isFavorite?: boolean;
  /** «Lo vi» de las últimas 72 h (solo en el directorio), el más reciente primero. */
  recentSightings?: LostAnimalSighting[];
}

export interface LostAnimalSighting {
  id: string;
  latitude: number;
  longitude: number;
  seenAt: string | null;
  /** Calle/colonia o ciudad. */
  place: string | null;
}

export interface AnimalFilters {
  type?: AnimalType | null;
  breed?: string | null;
  status?: string | null;
  location?: string | null;
  name?: string | null;
  favoritesOnly?: boolean;
}
