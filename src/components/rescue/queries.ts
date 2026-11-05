import { gql } from '@apollo/client';
import type {
  RescueAnimalRow,
  RescueMember,
  RescueOrganization,
  RescueOrganizationWithMembers,
} from './types';

/**
 * Espacios de rescate en el panel (con sesión). La escritura del equipo y la activación pasan por
 * mutaciones propias del backend; el perfil (y el logo/portada) se edita con
 * `updateRescueOrganization`, que solo deja a admins y coordinadores.
 */

const RESCUE_ORG_FIELDS = `
  id
  name
  slug
  type
  description
  city
  state
  species
  capacity
  whatsapp
  email
  websiteUrl
  facebookUrl
  instagramUrl
  tiktokUrl
  donationUrl
  donationInfo
  needs
  status
  statusNote
  verifiedAt
  isAlly
  allySince
  logo {
    url
  }
  cover {
    url
  }
  viewerRole
  publishedCount
  adoptedCount
  inAdoptionCount
  membersCount
  createdAt
`;

const RESCUE_MEMBER_FIELDS = `
  id
  role
  userName
  userEmail
  isViewer
  createdAt
`;

/** Los espacios de los que la persona es parte. Filtra por `userId` (un admin de plataforma vería todos). */
export const MY_RESCUE_ORGS_QUERY = gql`
  query MyRescueOrganizations($userId: ID!) {
    rescueOrganizations(
      where: { members: { some: { user: { id: { equals: $userId } } } } }
      orderBy: [{ createdAt: asc }]
    ) {
      ${RESCUE_ORG_FIELDS}
    }
  }
`;

export interface MyRescueOrgsResponse {
  rescueOrganizations: RescueOrganization[];
}

export const RESCUE_ORG_DETAIL_QUERY = gql`
  query RescueOrganizationDetail($id: ID!) {
    rescueOrganization(where: { id: $id }) {
      ${RESCUE_ORG_FIELDS}
      members(orderBy: [{ createdAt: asc }]) {
        ${RESCUE_MEMBER_FIELDS}
      }
    }
  }
`;

export interface RescueOrgDetailResponse {
  rescueOrganization: RescueOrganizationWithMembers | null;
}

/** Animales publicados a nombre del espacio, más recientes primero (sin los unidos a otro). */
export const RESCUE_ORG_ANIMALS_QUERY = gql`
  query RescueOrganizationAnimals($where: AnimalWhereInput!, $take: Int!, $skip: Int!) {
    animals(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      slug
      name
      createdAt
      user {
        id
        name
      }
      animal_type {
        name
      }
      logs(orderBy: [{ date_status: desc }], take: 1) {
        status
        date_status
        city
      }
      multimedia(orderBy: [{ order: asc }], take: 1) {
        image {
          url
        }
      }
    }
    animalsCount(where: $where)
  }
`;

export interface RescueOrgAnimalsResponse {
  animals: RescueAnimalRow[];
  animalsCount: number;
}

export function rescueAnimalsWhere(organizationId: string) {
  return {
    organization: { id: { equals: organizationId } },
    duplicateOf: null,
  };
}

export const ACTIVATE_RESCUE_ORG_MUTATION = gql`
  mutation ActivateRescueOrganization($input: RescueOrganizationCreateInput!) {
    activateRescueOrganization(input: $input) {
      success
      message
      organization {
        ${RESCUE_ORG_FIELDS}
      }
    }
  }
`;

export interface ActivateRescueOrgInput {
  name: string;
  type: string;
  city?: string;
  state?: string;
  species?: string[];
  description?: string;
  whatsapp?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
}

export interface ActivateRescueOrgResponse {
  activateRescueOrganization: {
    success: boolean;
    message: string;
    organization: RescueOrganization | null;
  };
}

/** Perfil, logo y portada (`{ upload: File }`). Solo admins y coordinadores del espacio. */
export const UPDATE_RESCUE_ORG_MUTATION = gql`
  mutation UpdateRescueOrganization($id: ID!, $data: RescueOrganizationUpdateInput!) {
    updateRescueOrganization(where: { id: $id }, data: $data) {
      ${RESCUE_ORG_FIELDS}
    }
  }
`;

export interface UpdateRescueOrgResponse {
  updateRescueOrganization: RescueOrganization | null;
}

const MEMBER_RESULT = `
  success
  message
  code
  member {
    ${RESCUE_MEMBER_FIELDS}
  }
`;

export const ADD_RESCUE_MEMBER_MUTATION = gql`
  mutation AddRescueOrganizationMember($organizationId: ID!, $email: String!, $role: String!) {
    addRescueOrganizationMember(organizationId: $organizationId, email: $email, role: $role) {
      ${MEMBER_RESULT}
    }
  }
`;

export const SET_RESCUE_MEMBER_ROLE_MUTATION = gql`
  mutation SetRescueOrganizationMemberRole($memberId: ID!, $role: String!) {
    setRescueOrganizationMemberRole(memberId: $memberId, role: $role) {
      ${MEMBER_RESULT}
    }
  }
`;

export const REMOVE_RESCUE_MEMBER_MUTATION = gql`
  mutation RemoveRescueOrganizationMember($memberId: ID!) {
    removeRescueOrganizationMember(memberId: $memberId) {
      ${MEMBER_RESULT}
    }
  }
`;

export interface RescueMemberResult {
  success: boolean;
  message: string;
  code?: string | null;
  member: RescueMember | null;
}

/** Consultas que se refrescan tras cambiar algo del espacio. */
export const RESCUE_REFETCH = ['MyRescueOrganizations', 'RescueOrganizationDetail'];
