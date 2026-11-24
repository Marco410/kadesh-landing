import type { PetPlace, PetPlaceDetail } from "../types";

/** The clinic in the shape the directory map takes (it draws lists of `PetPlace`). */
export function detailToMapPlace(place: PetPlaceDetail): PetPlace {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    description: place.description,
    phone: place.phone,
    address: place.address,
    street: place.street,
    state: place.state,
    country: place.country,
    cp: place.cp,
    municipality: place.municipality,
    lat: place.lat,
    lng: place.lng,
    distance: null,
    isOpen: place.isOpen,
    google_place_id: null,
    google_opening_hours: null,
    website: place.website,
    views: place.views,
    createdAt: place.createdAt,
    pet_place_reviews: [],
    pet_place_social_media: place.pet_place_social_media.map((s) => ({
      ...s,
      createdAt: "",
    })),
    pet_place_likes: [],
    services: place.services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: null,
      active: null,
      createdAt: "",
    })),
    types: place.types ?? [],
    user: place.user
      ? {
          id: place.user.id,
          name: place.user.name,
          lastName: place.user.lastName,
          username: place.user.username,
          email: "",
          phone: null,
          verified: place.user.verified,
          profileImage: place.user.profileImage,
        }
      : null,
    reviewsCount: place.reviewsCount ?? null,
    averageRating: place.averageRating ?? null,
    verified: place.verified ?? null,
  };
}
