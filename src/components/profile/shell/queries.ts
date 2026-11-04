import { gql } from "@apollo/client";

/**
 * Globos del menú del panel, en una sola consulta. El backend ya limita lo que cada quien ve
 * (recordatorios de sus mascotas; citas como cliente o como dueño de una clínica verificada), pero
 * filtramos explícito por el usuario: un admin de plataforma vería las de todos.
 *
 * - `reminders`: recordatorios abiertos (pendiente o avisado) que vencen hasta `$soon` (hoy + 7),
 *   incluidos los ya vencidos.
 * - `upcomingAppointments`: citas que reservó, pendientes o confirmadas, desde ahora.
 * - `clinicPendingAppointments`: citas por confirmar en sus clínicas, desde ahora.
 */
export const PROFILE_NAV_COUNTS_QUERY = gql`
  query ProfileNavCounts($userId: ID!, $now: DateTime!, $soon: CalendarDay!) {
    reminders: petRemindersCount(
      where: {
        pet: { owners: { some: { user: { id: { equals: $userId } } } } }
        status: { in: ["pending", "sent"] }
        dueDate: { lte: $soon }
      }
    )
    upcomingAppointments: petPlaceAppointmentsCount(
      where: {
        customer: { id: { equals: $userId } }
        status: { in: ["pending", "confirmed"] }
        startsAt: { gte: $now }
      }
    )
    clinicPendingAppointments: petPlaceAppointmentsCount(
      where: {
        pet_place: { user: { id: { equals: $userId } } }
        status: { equals: "pending" }
        startsAt: { gte: $now }
      }
    )
  }
`;

export type ProfileNavCountsResponse = {
  reminders: number | null;
  upcomingAppointments: number | null;
  clinicPendingAppointments: number | null;
};

export type ProfileNavCountsVariables = {
  userId: string;
  now: string;
  soon: string;
};
