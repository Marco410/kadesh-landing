import { gql } from '@apollo/client';

export const AUTHENTICATED_ITEM_QUERY = gql(`
  query AuthenticatedItem {
    authenticatedItem {
      ... on User {
        id
        name
        lastName
        secondLastName
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
        birthday
        age
        createdAt
      }
    }
  }
`);

export const AUTHENTICATE_USER_MUTATION = gql`
  mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          lastName
          name
          phone
          email
          profileImage {
            url
          }
          roles {
            name
          }
          secondLastName
          username
          verified
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      name
      lastName
      email
      phone
    }
  }
`;

export interface AuthenticateUserVariables {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  authenticateUserWithPassword:
    | {
        __typename: 'UserAuthenticationWithPasswordSuccess';
        sessionToken: string;
        item: {
          id: string;
          lastName: string;
          name: string;
          phone: string | null;
          email: string;
          profileImage: {
            url: string;
          } | null;
          roles: {
            name: string;
          }[];
          secondLastName: string | null;
          username: string;
          verified: boolean;
        };
      }
    | {
        __typename: 'UserAuthenticationWithPasswordFailure';
        message: string;
      }
    | null;
}

export interface CreateUserVariables {
  data: {
    name: string;
    lastName: string;
    secondLastName?: string;
    email: string;
    password: string;
    phone?: string;
  };
}

export interface CreateUserResponse {
  createUser: {
    name: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

export const CREATE_CONTACT_FORM_MUTATION = gql`
  mutation CreateContactForms($data: [ContactFormCreateInput!]!) {
    createContactForms(data: $data) {
      id
      message
      email
      name
      phone
      subject
    }
  }
`;

export interface CreateContactFormVariables {
  data: Array<{
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status?: string;
  }>;
}

export interface CreateContactFormResponse {
  createContactForms: Array<{
    id: string;
    message: string;
    email: string;
    name: string;
    phone: string | null;
    subject: string;
  }>;
}