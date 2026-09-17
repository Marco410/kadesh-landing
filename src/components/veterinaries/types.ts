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
  id?: string;
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
  slug?: string | null;
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
  pet_place_likesCount?: number | null;
  services: PetPlaceService[];
  types: PetPlaceType[];
  user: PetPlaceUser | null;
  reviewsCount?: number | null;
  averageRating?: number | null;
  verified?: boolean | null;
}

export interface NearbyPetPlacesInput {
  lat: number | null;
  lng: number | null;
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

export interface PetPlaceWhereUniqueInput {
  id?: string;
  slug?: string;
}

/** Schedule row for detail page (day, timeIni, timeEnd) */
export interface PetPlaceSchedule {
  day: string;
  timeIni: string | null;
  timeEnd: string | null;
  createdAt?: string;
}

/** Pet place detail (single place by id) - matches GET_PET_PLACE query */
export interface PetPlaceDetail {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  address: string | null;
  street: string | null;
  state: string | null;
  municipality: string | null;
  country: string | null;
  cp: string | null;
  lat: string;
  lng: string;
  phone: string | null;
  website: string | null;
  whatsapp: string | null;
  email: string | null;
  emergencies: boolean | null;
  parking: boolean | null;
  appointmentRequired: boolean | null;
  verified: boolean | null;
  claimStatus: string | null;
  isOpen: boolean | null;
  views: string | null;
  averageRating: number | null;
  reviewsCount: number | null;
  pet_place_likesCount?: number | null;
  createdAt: string;
  pet_place_reviews: Array<{
    google_user: string | null;
    id: string;
    rating: number | null;
    review: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      lastName: string | null;
      username: string;
      verified: boolean;
      profileImage: { url: string } | null;
    } | null;
  }>;
  pet_place_reviewsCount: number | null;
  pet_place_schedules: PetPlaceSchedule[];
  pet_place_social_media: Array<{
    id?: string;
    link: string | null;
    social_media: string | null;
  }>;
  services: Array<{
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    active?: boolean | null;
  }>;
  user: {
    id: string;
    name: string;
    lastName: string | null;
    secondLastName?: string | null;
    username: string;
    verified: boolean;
    profileImage: { url: string } | null;
  } | null;
}
