import { gql } from '@apollo/client';

const LEVEL_FIELDS = `
  level
  key
  label
  from
  nextAt
`;

export const REPORT_FIELDS = `
  id
  slug
  displayName
  status
  outcome
  city
  coverUrl
  createdAt
`;

/** Perfil público completo; lo pide el servidor (`server.ts`). */
export const PUBLIC_USER_PROFILE_QUERY = `
  query PublicUserProfile($username: String!) {
    publicUserProfile(username: $username) {
      username
      displayName
      avatarUrl
      bio
      phone
      email
      memberSince
      level { ${LEVEL_FIELDS} }
      lifetimeEarned
      streakWeeks
      rank
      reportsCount
      eventsCount
      reports { ${REPORT_FIELDS} }
      events { id slug title city state firstStartsAt lastEndsAt }
      rescueOrgs { id slug name city state logoUrl role }
      clinics { id slug name municipality state }
    }
  }
`;

/** «Ver más reportes» en el perfil público, de 12 en 12. */
export const PUBLIC_USER_REPORTS_QUERY = gql`
  query PublicUserReports($username: String!, $take: Int, $skip: Int) {
    publicUserReports(username: $username, take: $take, skip: $skip) {
      ${REPORT_FIELDS}
    }
  }
`;

/** Quién publicó un reporte (ficha del animal). Consulta aparte: si falla, la ficha sigue. */
export const ANIMAL_AUTHOR_QUERY = gql`
  query AnimalAuthor($animalId: ID!) {
    animalAuthor(animalId: $animalId) {
      username
      displayName
      avatarUrl
      level { ${LEVEL_FIELDS} }
    }
  }
`;
