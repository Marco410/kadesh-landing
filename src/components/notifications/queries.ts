import { gql } from '@apollo/client';
import type { AppNotification } from './types';

export const NOTIFICATION_INBOX_QUERY = gql`
  query NotificationInbox($take: Int!, $skip: Int!) {
    notifications(
      where: { product: { equals: "pet" } }
      orderBy: { createdAt: desc }
      take: $take
      skip: $skip
    ) {
      id
      type
      title
      body
      url
      readAt
      createdAt
    }
  }
`;

export interface NotificationInboxVariables {
  take: number;
  skip: number;
}

export interface NotificationInboxResponse {
  notifications: AppNotification[];
}

export const NOTIFICATION_UNREAD_COUNT_QUERY = gql`
  query NotificationUnreadCount {
    notificationsCount(where: { product: { equals: "pet" }, readAt: { equals: null } })
  }
`;

export interface NotificationUnreadCountResponse {
  notificationsCount: number;
}

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!, $readAt: DateTime) {
    updateNotification(where: { id: $id }, data: { readAt: $readAt }) {
      id
      readAt
    }
  }
`;

export interface MarkNotificationReadVariables {
  id: string;
  readAt: string | null;
}

export interface MarkNotificationReadResponse {
  updateNotification: { id: string; readAt: string | null } | null;
}

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead(product: "pet")
  }
`;

export interface MarkAllNotificationsReadResponse {
  markAllNotificationsRead: number;
}

export const PET_ALERT_SETTINGS_QUERY = gql`
  query PetAlertSettings($id: ID!) {
    user(where: { id: $id }) {
      id
      petAlertsEnabled
      alertLat
      alertLng
      alertRadiusKm
    }
  }
`;

export interface PetAlertSettingsUser {
  id: string;
  petAlertsEnabled: boolean | null;
  alertLat: number | null;
  alertLng: number | null;
  alertRadiusKm: number | null;
}

export interface PetAlertSettingsResponse {
  user: PetAlertSettingsUser | null;
}

export const UPDATE_PET_ALERT_SETTINGS_MUTATION = gql`
  mutation UpdatePetAlertSettings($id: ID!, $data: UserUpdateInput!) {
    updateUser(where: { id: $id }, data: $data) {
      id
      petAlertsEnabled
      alertLat
      alertLng
      alertRadiusKm
    }
  }
`;

export interface UpdatePetAlertSettingsVariables {
  id: string;
  data: {
    petAlertsEnabled: boolean;
    alertLat: number | null;
    alertLng: number | null;
    alertRadiusKm: number;
  };
}

export interface UpdatePetAlertSettingsResponse {
  updateUser: PetAlertSettingsUser | null;
}
