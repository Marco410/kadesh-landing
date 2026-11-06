import { gql } from '@apollo/client';
import type {
  AdoptionApplication,
  AdoptionApplicationInput,
  AdoptionReviewStatus,
  MyAdoptionApplication,
} from './types';

/**
 * Solicitudes de adopción (`AdoptionApplication` de kadesh-back). Solo se leen por CRUD: las ve
 * quien la envió, quien puede editar el animal (autor o su espacio de rescate) y los admins. Se
 * escriben con las cuatro mutaciones de abajo, que no lanzan error por reglas de negocio: regresan
 * `success: false` y un `message` en español listo para mostrar.
 */

const ADOPTION_APPLICATION_FIELDS = `
  id
  status
  applicantName
  applicantEmail
  phone
  message
  answers
  decisionNote
  decidedAt
  createdAt
  updatedAt
  animal {
    id
    name
    slug
    organization {
      id
      name
    }
  }
  pet {
    id
  }
`;

/** La última solicitud de quien consulta para este animal (abierta o no). */
export const MY_ADOPTION_APPLICATION_QUERY = gql`
  query MyAdoptionApplication($animalId: ID!, $userId: ID!) {
    adoptionApplications(
      where: { animal: { id: { equals: $animalId } }, applicant: { id: { equals: $userId } } }
      orderBy: [{ createdAt: desc }]
      take: 1
    ) {
      id
      status
      decisionNote
      decidedAt
      createdAt
    }
  }
`;

export interface MyAdoptionApplicationResponse {
  adoptionApplications: MyAdoptionApplication[];
}

/** Solicitudes de un animal, de la más nueva a la más vieja (panel de la ficha pública). */
export const ANIMAL_ADOPTION_APPLICATIONS_QUERY = gql`
  query AnimalAdoptionApplications($animalId: ID!, $take: Int!, $skip: Int!) {
    adoptionApplications(
      where: { animal: { id: { equals: $animalId } } }
      orderBy: [{ createdAt: desc }]
      take: $take
      skip: $skip
    ) {
      ${ADOPTION_APPLICATION_FIELDS}
    }
    adoptionApplicationsCount(where: { animal: { id: { equals: $animalId } } })
  }
`;

export interface AnimalAdoptionApplicationsResponse {
  adoptionApplications: AdoptionApplication[];
  adoptionApplicationsCount: number;
}

/**
 * Solicitudes de los animales de un espacio de rescate. `where` es la lista que se pinta (abiertas
 * o todas); `openWhere` y `allWhere` solo cuentan, para los filtros.
 */
export const RESCUE_ADOPTION_APPLICATIONS_QUERY = gql`
  query RescueAdoptionApplications(
    $where: AdoptionApplicationWhereInput!
    $openWhere: AdoptionApplicationWhereInput!
    $allWhere: AdoptionApplicationWhereInput!
    $take: Int!
    $skip: Int!
  ) {
    adoptionApplications(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      ${ADOPTION_APPLICATION_FIELDS}
    }
    openCount: adoptionApplicationsCount(where: $openWhere)
    allCount: adoptionApplicationsCount(where: $allWhere)
  }
`;

export interface RescueAdoptionApplicationsResponse {
  adoptionApplications: AdoptionApplication[];
  openCount: number;
  allCount: number;
}

/** `where` de las solicitudes de un espacio; con `statuses`, solo esas. */
export function rescueAdoptionWhere(orgId: string, statuses?: string[]) {
  return {
    animal: { organization: { id: { equals: orgId } } },
    ...(statuses ? { status: { in: statuses } } : {}),
  };
}

const ADOPTION_RESULT_FIELDS = `
  success
  message
  application {
    id
    status
    decisionNote
    decidedAt
    updatedAt
  }
`;

export interface AdoptionApplicationResult {
  success: boolean;
  message: string;
  application?: Pick<AdoptionApplication, 'id' | 'status' | 'decisionNote' | 'decidedAt' | 'updatedAt'> | null;
}

export const SUBMIT_ADOPTION_APPLICATION_MUTATION = gql`
  mutation SubmitAdoptionApplication($animalId: ID!, $input: AdoptionApplicationInput!) {
    submitAdoptionApplication(animalId: $animalId, input: $input) {
      ${ADOPTION_RESULT_FIELDS}
    }
  }
`;

export interface SubmitAdoptionApplicationResponse {
  submitAdoptionApplication: AdoptionApplicationResult;
}

export interface SubmitAdoptionApplicationVariables {
  animalId: string;
  input: AdoptionApplicationInput;
}

/** `status`: `in_review`, `approved` o `rejected`. `note` le llega a quien la envió. */
export const REVIEW_ADOPTION_APPLICATION_MUTATION = gql`
  mutation ReviewAdoptionApplication($applicationId: ID!, $status: String!, $note: String) {
    reviewAdoptionApplication(applicationId: $applicationId, status: $status, note: $note) {
      ${ADOPTION_RESULT_FIELDS}
    }
  }
`;

export interface ReviewAdoptionApplicationResponse {
  reviewAdoptionApplication: AdoptionApplicationResult;
}

export interface ReviewAdoptionApplicationVariables {
  applicationId: string;
  status: AdoptionReviewStatus;
  note?: string | null;
}

export const WITHDRAW_ADOPTION_APPLICATION_MUTATION = gql`
  mutation WithdrawAdoptionApplication($applicationId: ID!) {
    withdrawAdoptionApplication(applicationId: $applicationId) {
      ${ADOPTION_RESULT_FIELDS}
    }
  }
`;

export interface WithdrawAdoptionApplicationResponse {
  withdrawAdoptionApplication: AdoptionApplicationResult;
}

/**
 * Solo desde `approved`. La cartilla del animal (o una nueva con los datos del reporte) pasa a quien
 * adopta, el reporte queda «Adoptado» y las demás solicitudes abiertas se cierran.
 */
export const COMPLETE_ADOPTION_APPLICATION_MUTATION = gql`
  mutation CompleteAdoptionApplication($applicationId: ID!) {
    completeAdoptionApplication(applicationId: $applicationId) {
      success
      message
      petId
    }
  }
`;

export interface CompleteAdoptionApplicationResponse {
  completeAdoptionApplication: {
    success: boolean;
    message: string;
    petId?: string | null;
  };
}
