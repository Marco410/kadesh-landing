import { gql } from '@apollo/client';
import type { PetDetail, PetSummary } from './types';

/** Mascotas de la persona con su próximo recordatorio pendiente. */
export const MY_PETS_QUERY = gql`
  query MyPets($where: PetWhereInput!) {
    pets(where: $where, orderBy: [{ name: asc }]) {
      id
      name
      status
      birthday
      approximateAge
      age
      animal_type {
        id
        name
      }
      animal_breed {
        id
        breed
      }
      multimedia(orderBy: [{ order: asc }], take: 1) {
        id
        image {
          url
        }
      }
      lostReport {
        id
        slug
      }
      reminders(where: { status: { equals: "pending" } }, orderBy: [{ dueDate: asc }], take: 1) {
        id
        title
        dueDate
      }
    }
  }
`;

export interface MyPetsResponse {
  pets: PetSummary[];
}

export interface MyPetsVariables {
  where: Record<string, unknown>;
}

export const PET_DETAIL_QUERY = gql`
  query PetDetail($id: ID!) {
    pet(where: { id: $id }) {
      id
      name
      status
      birthday
      approximateAge
      age
      sex
      color
      distinctiveMarks
      weightKg
      sterilized
      microchipNumber
      animal_type {
        id
        name
      }
      animal_breed {
        id
        breed
      }
      multimedia(orderBy: [{ order: asc }]) {
        id
        order
        image {
          url
        }
      }
      lostReport {
        id
        slug
      }
      owners(orderBy: [{ createdAt: asc }]) {
        id
        role
        userName
        user {
          id
        }
      }
      healthRecords(orderBy: [{ appliedDate: desc }, { createdAt: desc }]) {
        id
        type
        name
        appliedDate
        nextDueDate
        notes
        verifiedByVet
        veterinary {
          id
          name
        }
        attachments {
          id
          image {
            url
          }
        }
      }
      reminders(orderBy: [{ dueDate: asc }]) {
        id
        title
        dueDate
        notifyDaysBefore
        channels
        status
        sentAt
        healthRecord {
          id
          type
          name
        }
      }
    }
  }
`;

export interface PetDetailResponse {
  pet: PetDetail | null;
}

/** Las listas que se recargan después de cualquier cambio en la cartilla. */
export const PET_REFETCH = ['MyPets', 'PetDetail'];

export const CREATE_PET_MUTATION = gql`
  mutation CreatePet($data: PetCreateInput!) {
    createPet(data: $data) {
      id
    }
  }
`;

export const UPDATE_PET_MUTATION = gql`
  mutation UpdatePet($id: ID!, $data: PetUpdateInput!) {
    updatePet(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export const DELETE_PET_MUTATION = gql`
  mutation DeletePet($id: ID!) {
    deletePet(where: { id: $id }) {
      id
    }
  }
`;

export const CREATE_PET_PHOTOS_MUTATION = gql`
  mutation CreatePetPhotos($data: [PetMultimediaCreateInput!]!) {
    createPetMultimedias(data: $data) {
      id
    }
  }
`;

export const DELETE_PET_PHOTOS_MUTATION = gql`
  mutation DeletePetPhotos($where: [PetMultimediaWhereUniqueInput!]!) {
    deletePetMultimedias(where: $where) {
      id
    }
  }
`;

export const CREATE_HEALTH_RECORD_MUTATION = gql`
  mutation CreatePetHealthRecord($data: PetHealthRecordCreateInput!) {
    createPetHealthRecord(data: $data) {
      id
    }
  }
`;

export const UPDATE_HEALTH_RECORD_MUTATION = gql`
  mutation UpdatePetHealthRecord($id: ID!, $data: PetHealthRecordUpdateInput!) {
    updatePetHealthRecord(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export const DELETE_HEALTH_RECORD_MUTATION = gql`
  mutation DeletePetHealthRecord($id: ID!) {
    deletePetHealthRecord(where: { id: $id }) {
      id
    }
  }
`;

export const CREATE_ATTACHMENTS_MUTATION = gql`
  mutation CreatePetHealthRecordAttachments($data: [PetHealthRecordAttachmentCreateInput!]!) {
    createPetHealthRecordAttachments(data: $data) {
      id
    }
  }
`;

export const DELETE_ATTACHMENTS_MUTATION = gql`
  mutation DeletePetHealthRecordAttachments($where: [PetHealthRecordAttachmentWhereUniqueInput!]!) {
    deletePetHealthRecordAttachments(where: $where) {
      id
    }
  }
`;

export const CREATE_REMINDER_MUTATION = gql`
  mutation CreatePetReminder($data: PetReminderCreateInput!) {
    createPetReminder(data: $data) {
      id
    }
  }
`;

export const UPDATE_REMINDER_MUTATION = gql`
  mutation UpdatePetReminder($id: ID!, $data: PetReminderUpdateInput!) {
    updatePetReminder(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export const DELETE_REMINDER_MUTATION = gql`
  mutation DeletePetReminder($id: ID!) {
    deletePetReminder(where: { id: $id }) {
      id
    }
  }
`;

export const MARK_PET_AS_LOST_MUTATION = gql`
  mutation MarkPetAsLost(
    $petId: ID!
    $lastSeenLocation: PetLastSeenLocationInput!
    $lastSeenDate: String!
    $notes: String
    $contactPhone: String
  ) {
    markPetAsLost(
      petId: $petId
      lastSeenLocation: $lastSeenLocation
      lastSeenDate: $lastSeenDate
      notes: $notes
      contactPhone: $contactPhone
    ) {
      petId
      reportId
      slug
      url
    }
  }
`;

export interface MarkPetAsLostResponse {
  markPetAsLost: { petId: string; reportId: string; slug: string; url: string };
}

export const MARK_PET_AS_FOUND_MUTATION = gql`
  mutation MarkPetAsFound($petId: ID!) {
    markPetAsFound(petId: $petId) {
      petId
      reportId
    }
  }
`;

export const ADD_PET_FAMILY_MEMBER_MUTATION = gql`
  mutation AddPetFamilyMember($petId: ID!, $email: String!) {
    addPetFamilyMember(petId: $petId, email: $email) {
      id
      role
      userName
    }
  }
`;

/** `extensions.code` de `addPetFamilyMember` cuando el correo no tiene cuenta. */
export const PET_FAMILY_USER_NOT_FOUND = 'PET_FAMILY_USER_NOT_FOUND';

/** El principal registra a un familiar sin cuenta: crea la cuenta con la contraseña que él elige. */
export const REGISTER_PET_FAMILY_MEMBER_MUTATION = gql`
  mutation RegisterPetFamilyMember($petId: ID!, $input: RegisterPetFamilyMemberInput!) {
    registerPetFamilyMember(petId: $petId, input: $input) {
      id
      role
      userName
      createdAccount
    }
  }
`;

export interface RegisterPetFamilyMemberResponse {
  registerPetFamilyMember: { id: string; role: string; userName: string; createdAccount: boolean };
}

export const DELETE_PET_OWNER_MUTATION = gql`
  mutation DeletePetOwner($id: ID!) {
    deletePetOwner(where: { id: $id }) {
      id
    }
  }
`;

/** Veterinarias del directorio por nombre, para ligarlas a un registro de la cartilla. */
export const SEARCH_VETERINARIES_QUERY = gql`
  query SearchVeterinaries($search: String!) {
    petPlaces(
      where: {
        name: { contains: $search, mode: insensitive }
        types: { some: { value: { equals: "veterinary" } } }
      }
      orderBy: [{ name: asc }]
      take: 8
    ) {
      id
      name
      municipality
    }
  }
`;

export interface SearchVeterinariesResponse {
  petPlaces: { id: string; name: string; municipality?: string | null }[];
}
