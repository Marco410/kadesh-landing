export type AnimalType = 'perro' | 'gato' | 'conejo' | 'ave' | 'otro';
export type AnimalStatus = 'perdido' | 'encontrado' | 'en_adopcion';

export interface LostAnimal {
  id: string;
  name: string;
  type: AnimalType;
  breed?: string;
  status: AnimalStatus;
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
  status?: AnimalStatus | null;
  location?: string | null;
  favoritesOnly?: boolean;
}
