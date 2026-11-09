"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_MY_ANIMALS_QUERY,
  type GetMyAnimalsResponse,
  type GetMyAnimalsVariables,
} from "kadesh/components/profile/queries";
import {
  buildAttention,
  buildClinicVariables,
  buildHomeVariables,
  clinicWeekPoints,
  isActiveReport,
  isManageablePlace,
  notificationSeries,
  weekDelta,
} from "./homeModel";
import {
  PROFILE_CLINIC_HOME_QUERY,
  PROFILE_HOME_QUERY,
  type ProfileClinicHomeResponse,
  type ProfileClinicHomeVariables,
  type ProfileHomeResponse,
  type ProfileHomeVariables,
} from "./queries";

/**
 * Datos del Inicio: la consulta del resumen, los reportes (misma consulta y variables que la vista
 * Reportes, así comparten caché) y, si tiene una clínica verificada, la de su veterinaria.
 */
export function useProfileHome({
  userId,
  hasPhone,
  unread,
}: {
  userId: string;
  hasPhone: boolean;
  unread: number;
}) {
  // La hora de referencia se fija al montar: las variables no cambian a cada render.
  const now = useMemo(() => new Date(), []);
  const homeVariables = useMemo(() => buildHomeVariables(userId, now), [userId, now]);

  const home = useQuery<ProfileHomeResponse, ProfileHomeVariables>(PROFILE_HOME_QUERY, {
    variables: homeVariables,
    fetchPolicy: "cache-and-network",
  });
  const reports = useQuery<GetMyAnimalsResponse, GetMyAnimalsVariables>(GET_MY_ANIMALS_QUERY, {
    variables: { where: { user: { id: { equals: userId } } }, orderBy: [{ createdAt: "desc" }] },
    fetchPolicy: "cache-and-network",
  });

  const places = useMemo(() => home.data?.myPetPlaces ?? [], [home.data]);
  const verifiedIds = useMemo(() => places.filter(isManageablePlace).map((place) => place.id), [places]);
  const clinicVariables = useMemo(
    () => (verifiedIds.length ? buildClinicVariables(userId, verifiedIds, now) : null),
    [userId, verifiedIds, now],
  );
  const clinic = useQuery<ProfileClinicHomeResponse, ProfileClinicHomeVariables>(PROFILE_CLINIC_HOME_QUERY, {
    variables: clinicVariables ?? undefined,
    skip: !clinicVariables,
    fetchPolicy: "cache-and-network",
  });

  const model = useMemo(() => {
    const data = home.data;
    const animals = reports.data?.animals ?? [];
    const series = notificationSeries(data);
    const nextAppointment = data?.upcomingAppointments?.[0] ?? null;
    const clinicPending = clinic.data?.pending ?? 0;
    const attention = data
      ? buildAttention({
          now,
          reminders: data.reminders ?? [],
          remindersCount: data.remindersCount ?? 0,
          nextAppointment,
          pendingClaims: data.pendingClaimsCount ?? 0,
          places,
          clinicPending,
          rescueOrgs: data.myRescueOrgs ?? [],
          hasPhone,
          alertsEnabled: data.me?.petAlertsEnabled ?? null,
        })
      : [];
    return {
      now,
      petsCount: data?.petsCount ?? 0,
      remindersCount: data?.remindersCount ?? 0,
      upcomingCount: data?.upcomingAppointmentsCount ?? 0,
      nextAppointment,
      reportsTotal: animals.length,
      reportsActive: animals.filter((animal) => isActiveReport(animal.logs?.[0]?.status)).length,
      unread,
      notificationSeries: series,
      notificationsThisWeek: series[series.length - 1] ?? 0,
      notificationDelta: weekDelta(series[series.length - 1] ?? 0, series[series.length - 2] ?? 0),
      attention,
      alertsEnabled: data?.me?.petAlertsEnabled ?? null,
      places,
      manageablePlaces: places.filter(isManageablePlace),
      clinic: clinicVariables
        ? {
            loading: clinic.loading && !clinic.data,
            today: clinic.data?.today ?? 0,
            pending: clinicPending,
            patients: (clinic.data?.places ?? []).reduce((sum, place) => sum + (place.patientsCount ?? 0), 0),
            weeks: clinicWeekPoints(clinic.data, now),
          }
        : null,
    };
  }, [home.data, reports.data, clinic.data, clinic.loading, clinicVariables, places, now, hasPhone, unread]);

  return {
    loading: (home.loading && !home.data) || (reports.loading && !reports.data),
    hasData: Boolean(home.data),
    error: home.error ?? reports.error ?? null,
    refetch: () => {
      void home.refetch();
      void reports.refetch();
      if (clinicVariables) void clinic.refetch();
    },
    model,
  };
}

export type ProfileHomeModel = ReturnType<typeof useProfileHome>["model"];
