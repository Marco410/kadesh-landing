import { gql } from "@apollo/client";

/**
 * Inicio del perfil, en una consulta. Los `where` que se repiten (lista + conteo) van como
 * variables; los arma `useProfileHome` (ver `buildHomeVariables`). El backend ya limita lo que cada
 * quien ve, pero filtramos explícito por el usuario: un admin de plataforma vería todo.
 *
 * - `n0`…`n7`: notificaciones recibidas en ventanas de 7 días hacia atrás (`n0` = últimos 7 días).
 *   Dan la sparkline y la pastilla de cambio del KPI de notificaciones.
 */
export const PROFILE_HOME_QUERY = gql`
  query ProfileHome(
    $userId: ID!
    $reminderWhere: PetReminderWhereInput!
    $upcomingWhere: PetPlaceAppointmentWhereInput!
    $n0: NotificationWhereInput!
    $n1: NotificationWhereInput!
    $n2: NotificationWhereInput!
    $n3: NotificationWhereInput!
    $n4: NotificationWhereInput!
    $n5: NotificationWhereInput!
    $n6: NotificationWhereInput!
    $n7: NotificationWhereInput!
  ) {
    me: user(where: { id: $userId }) {
      id
      petAlertsEnabled
    }
    petsCount(where: { owners: { some: { user: { id: { equals: $userId } } } } })
    reminders: petReminders(where: $reminderWhere, orderBy: [{ dueDate: asc }], take: 5) {
      id
      title
      dueDate
      pet {
        id
        name
      }
    }
    remindersCount: petRemindersCount(where: $reminderWhere)
    upcomingAppointments: petPlaceAppointments(where: $upcomingWhere, orderBy: [{ startsAt: asc }], take: 1) {
      id
      startsAt
      status
      petName
      pet_place {
        id
        name
      }
    }
    upcomingAppointmentsCount: petPlaceAppointmentsCount(where: $upcomingWhere)
    pendingClaimsCount: animalClaimsCount(
      where: { animal: { user: { id: { equals: $userId } } }, status: { equals: "pending" } }
    )
    myPetPlaces: petPlaces(where: { user: { id: { equals: $userId } } }, orderBy: [{ name: asc }]) {
      id
      name
      verified
      claimStatus
    }
    n0: notificationsCount(where: $n0)
    n1: notificationsCount(where: $n1)
    n2: notificationsCount(where: $n2)
    n3: notificationsCount(where: $n3)
    n4: notificationsCount(where: $n4)
    n5: notificationsCount(where: $n5)
    n6: notificationsCount(where: $n6)
    n7: notificationsCount(where: $n7)
  }
`;

export type HomeReminder = {
  id: string;
  title: string;
  dueDate: string;
  pet: { id: string; name: string } | null;
};

export type HomeAppointment = {
  id: string;
  startsAt: string;
  status: string;
  petName: string | null;
  pet_place: { id: string; name: string } | null;
};

export type HomePetPlace = {
  id: string;
  name: string;
  verified: boolean | null;
  claimStatus: string | null;
};

export type ProfileHomeResponse = {
  me: { id: string; petAlertsEnabled: boolean | null } | null;
  petsCount: number | null;
  reminders: HomeReminder[] | null;
  remindersCount: number | null;
  upcomingAppointments: HomeAppointment[] | null;
  upcomingAppointmentsCount: number | null;
  pendingClaimsCount: number | null;
  myPetPlaces: HomePetPlace[] | null;
} & Record<`n${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`, number | null>;

export type ProfileHomeVariables = {
  userId: string;
  reminderWhere: Record<string, unknown>;
  upcomingWhere: Record<string, unknown>;
} & Record<`n${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`, Record<string, unknown>>;

/**
 * Fila "Mi veterinaria" (solo si tiene al menos una clínica verificada). Va aparte para no pedir
 * nada a quien no tiene clínica.
 *
 * - `c0`…`c7`: citas por semana de calendario (lunes a domingo), `c0` = la semana en curso.
 *   No cuenta las canceladas.
 */
export const PROFILE_CLINIC_HOME_QUERY = gql`
  query ProfileClinicHome(
    $placeIds: [ID!]!
    $todayWhere: PetPlaceAppointmentWhereInput!
    $pendingWhere: PetPlaceAppointmentWhereInput!
    $c0: PetPlaceAppointmentWhereInput!
    $c1: PetPlaceAppointmentWhereInput!
    $c2: PetPlaceAppointmentWhereInput!
    $c3: PetPlaceAppointmentWhereInput!
    $c4: PetPlaceAppointmentWhereInput!
    $c5: PetPlaceAppointmentWhereInput!
    $c6: PetPlaceAppointmentWhereInput!
    $c7: PetPlaceAppointmentWhereInput!
  ) {
    today: petPlaceAppointmentsCount(where: $todayWhere)
    pending: petPlaceAppointmentsCount(where: $pendingWhere)
    places: petPlaces(where: { id: { in: $placeIds } }) {
      id
      patientsCount
    }
    c0: petPlaceAppointmentsCount(where: $c0)
    c1: petPlaceAppointmentsCount(where: $c1)
    c2: petPlaceAppointmentsCount(where: $c2)
    c3: petPlaceAppointmentsCount(where: $c3)
    c4: petPlaceAppointmentsCount(where: $c4)
    c5: petPlaceAppointmentsCount(where: $c5)
    c6: petPlaceAppointmentsCount(where: $c6)
    c7: petPlaceAppointmentsCount(where: $c7)
  }
`;

export type ProfileClinicHomeResponse = {
  today: number | null;
  pending: number | null;
  places: Array<{ id: string; patientsCount: number | null }> | null;
} & Record<`c${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`, number | null>;

export type ProfileClinicHomeVariables = {
  placeIds: string[];
  todayWhere: Record<string, unknown>;
  pendingWhere: Record<string, unknown>;
} & Record<`c${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`, Record<string, unknown>>;
