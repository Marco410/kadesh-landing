"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { RESCUE_ORG_ACTIVE_STATUSES, canPublishForRescue } from "../constants";
import { MY_RESCUE_ORGS_QUERY, type MyRescueOrgsResponse } from "../queries";
import type { RescueOrganization } from "../types";

/**
 * Espacios de rescate a cuyo nombre la persona puede publicar un animal: es admin, coordinadora o
 * voluntaria, y el espacio está activo (en revisión o verificado). Sin sesión no consulta.
 */
export function usePublishableRescueOrgs(userId: string | null | undefined): {
  orgs: RescueOrganization[];
  loading: boolean;
} {
  const { data, loading } = useQuery<MyRescueOrgsResponse>(MY_RESCUE_ORGS_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "cache-first",
  });
  const orgs = useMemo(
    () =>
      (data?.rescueOrganizations ?? []).filter(
        (org) => canPublishForRescue(org.viewerRole) && RESCUE_ORG_ACTIVE_STATUSES.includes(org.status),
      ),
    [data],
  );
  return { orgs, loading };
}
