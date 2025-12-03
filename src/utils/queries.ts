import { gql } from '@apollo/client';

export const AUTHENTICATED_ITEM_QUERY = gql(`
  query AuthenticatedItem {
    authenticatedItem {
      ... on User {
        id
        name
        lastName
        username
        email
        verified
        phone
        profileImage {
          url
        }
        roles{
          name
        }
        createdAt
      }
    }
  }
`);