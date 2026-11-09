"use client";

import { useQuery } from '@apollo/client';
import { MY_ADOPTION_APPLICATION_QUERY, type MyAdoptionApplicationResponse } from '../queries';

/** La última solicitud de la persona para este animal. Sin sesión (o sin `enabled`) no consulta. */
export function useMyAdoptionApplication(
  animalId: string | null | undefined,
  userId: string | null | undefined,
  enabled: boolean,
) {
  const skip = !animalId || !userId || !enabled;
  const { data, loading, refetch } = useQuery<MyAdoptionApplicationResponse>(MY_ADOPTION_APPLICATION_QUERY, {
    variables: { animalId, userId },
    skip,
    fetchPolicy: 'cache-and-network',
  });

  return {
    application: skip ? null : (data?.adoptionApplications?.[0] ?? null),
    /** Primera carga: aún no se sabe si ya envió una. */
    loading: !skip && loading && !data,
    refetch,
  };
}
