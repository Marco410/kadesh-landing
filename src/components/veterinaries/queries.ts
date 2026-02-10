import { gql } from '@apollo/client';

export const GET_NEARBY_PET_PLACES = gql`
  query GetNearbyPetPlaces($input: NearbyPetPlacesInput!, $where: PetPlaceWhereInput!) {
    getNearbyPetPlaces(input: $input) {
      message
      success
      petPlaces {
        id
        name
        description
        phone
        state
        address
        country
        cp
        createdAt
        distance
        google_opening_hours
        google_place_id
        isOpen
        lat
        lng
        municipality
        street
        views
        website
        pet_place_reviews {
          id
          rating
          review
          google_user
          google_user_photo
          createdAt
          user {
            name
            lastName
            secondLastName
            username
            email
            phone
            verified
            profileImage {
              url
            }
          }
        }
        pet_place_social_media {
          link
          social_media
          createdAt
        }
        pet_place_likes {
          id
        }
        services {
          id
          name
          slug
          description
          active
          createdAt
        }
        types {
          label
          value
        }
        user {
          id
          name
          lastName
          username
          email
          phone
          verified
          profileImage {
            url
          }
        }
        reviewsCount
        averageRating
      }
    }
    petPlacesCount(where: $where)
  }
`;

export const GET_PET_PLACE = gql`
  query PetPlace($where: PetPlaceWhereUniqueInput!) {
    petPlace(where: $where) {
      id
      name
      description
      address
      street
      state
      municipality
      country
      cp
      lat
      lng
      phone
      website
      isOpen
      views
      averageRating
      reviewsCount
      pet_place_likesCount
      createdAt
      pet_place_reviews(orderBy: [{ createdAt: desc }]) {
        id
        rating
        review
        createdAt
        google_user
        user {
          id
          name
          lastName
          username
          verified
          profileImage {
            url
          }
        }
      }
      pet_place_reviewsCount
      pet_place_schedules {
        day
        timeIni
        timeEnd
        createdAt
      }
      pet_place_social_media {
        link
        social_media
      }
      services {
        id
        name
        description
        slug
      }
      user {
        id
        name
        lastName
        secondLastName
        username
        verified
        profileImage {
          url
        }
      }
    }
  }
`;

export const CREATE_PET_PLACE_REVIEW_MUTATION = gql`
  mutation CreatePetPlaceReview($data: ReviewCreateInput!) {
    createReview(data: $data) {
      id
      rating
      review
      createdAt
      user {
        id
        name
        lastName
        profileImage {
          url
        }
      }
    }
  }
`;

export interface CreatePetPlaceReviewVariables {
  data: {
    rating: number;
    review?: string | null;
    pet_place: { connect: { id: string } };
    user: { connect: { id: string } };
    google_user?: string | null;
  };
}

export interface CreatePetPlaceReviewResponse {
  createReview: {
    id: string;
    rating: number | null;
    review: string | null;
    createdAt: string;
    user: { id: string; name: string; lastName: string | null; profileImage: { url: string } | null } | null;
  };
}

export const DELETE_PET_PLACE_REVIEW_MUTATION = gql`
  mutation DeletePetPlaceReview($where: PetPlaceReviewWhereUniqueInput!) {
    deletePetPlaceReview(where: $where) {
      id
    }
  }
`;

export interface DeletePetPlaceReviewVariables {
  where: { id: string };
}

export interface DeletePetPlaceReviewResponse {
  deletePetPlaceReview: { id: string };
}
