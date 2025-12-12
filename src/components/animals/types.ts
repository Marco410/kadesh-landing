export type AnimalType = 'perro' | 'gato' | 'conejo' | 'ave' | 'otro';

export interface LostAnimal {
  id: string;
  name: string;
  type: AnimalType;
  breed?: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image?: {
    url: string;
  };
  description?: string;
  createdAt: string;
  updatedAt?: string;
  contactPhone?: string;
  contactEmail?: string;
  isFavorite?: boolean;
}

export interface AnimalFilters {
  type?: AnimalType | null;
  breed?: string | null;
  status?: string | null;
  location?: string | null;
  name?: string | null;
  favoritesOnly?: boolean;
}
