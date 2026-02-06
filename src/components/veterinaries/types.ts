export interface PetPlaceReview {
  id: string;
  rating: number | null;
  review: string | null;
  google_user: string | null;
  google_user_photo: string | null;
  createdAt: string;
  user: {
    name: string;
    lastName: string | null;
    secondLastName: string | null;
    username: string;
    email: string;
    phone: string | null;
    verified: boolean;
    profileImage: { url: string } | null;
  } | null;
}

export interface PetPlaceSocialMedia {
  link: string | null;
  social_media: string | null;
  createdAt: string;
}

export interface PetPlaceService {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  active: boolean | null;
  createdAt: string;
}

export interface PetPlaceType {
  label: string | null;
  value: string | null;
}

export interface PetPlaceUser {
  id: string;
  name: string;
  lastName: string | null;
  username: string;
  email: string;
  phone: string | null;
  verified: boolean;
  profileImage: { url: string } | null;
}

export interface PetPlace {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  street: string | null;
  state: string | null;
  country: string | null;
  cp: string | null;
  municipality: string | null;
  lat: string;
  lng: string;
  distance: number | null;
  isOpen: boolean | null;
  google_place_id: string | null;
  google_opening_hours: string | null;
  website: string | null;
  views: string | null;
  createdAt: string;
  pet_place_reviews: PetPlaceReview[];
  pet_place_social_media: PetPlaceSocialMedia[];
  pet_place_likes: { id: string }[];
  services: PetPlaceService[];
  types: PetPlaceType[];
  user: PetPlaceUser | null;
  reviewsCount?: number | null;
  averageRating?: number | null;
}

export interface NearbyPetPlacesInput {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
  type: string;
  skip?: number;
}

export interface PetPlaceWhereInput {
  types?: {
    some?: { value?: { equals?: string } };
  };
}
