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
