"use client";

import { useMutation, useQuery } from '@apollo/client';
import {
  CANCEL_ANIMAL_CLAIM_MUTATION,
  CREATE_ANIMAL_CLAIM_MUTATION,
  GET_ANIMAL_CLAIMS_QUERY,
  RESOLVE_ANIMAL_CLAIM_MUTATION,
  type AnimalClaimResult,
  type CreateAnimalClaimVariables,
  type GetAnimalClaimsResponse,
} from 'kadesh/components/animals/queries';

/** Mensaje de Keystone sin el envoltorio («You provided invalid data… - AnimalClaim: …»). */
export function claimErrorMessage(error: unknown): string {
  const raw =
    (error as { graphQLErrors?: Array<{ message?: string }> })?.graphQLErrors?.[0]?.message ||
    (error instanceof Error ? error.message : '');
  const detail = raw
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('- '));
  const text = (detail ? detail.replace(/^-\s*[A-Za-z]+:\s*/, '') : raw.split('\n')[0]).trim();
  if (!text || /invalid data|access denied/i.test(text)) {
    return 'No se pudo enviar la solicitud. Inténtalo de nuevo.';
  }
  return text;
}

/**
 * Solicitudes para quedarse con un reporte. El backend solo regresa las que te tocan: las tuyas,
 * las del reporte que atiendes, o todas si eres admin. Sin sesión no se consulta.
 */
export function useAnimalClaims(animalId: string | null | undefined, enabled: boolean) {
  const { data, loading, refetch } = useQuery<GetAnimalClaimsResponse>(GET_ANIMAL_CLAIMS_QUERY, {
    variables: { animalId },
    skip: !animalId || !enabled,
    fetchPolicy: 'cache-and-network',
  });

  const [resolveMutation, { loading: resolving }] = useMutation<
    { resolveAnimalClaim: AnimalClaimResult },
    { claimId: string; approve: boolean; reason?: string | null }
  >(RESOLVE_ANIMAL_CLAIM_MUTATION);
  const [cancelMutation, { loading: cancelling }] = useMutation<
    { cancelAnimalClaim: AnimalClaimResult },
    { claimId: string }
  >(CANCEL_ANIMAL_CLAIM_MUTATION);

  const resolveClaim = async (claimId: string, approve: boolean, reason?: string | null) => {
    const { data: result } = await resolveMutation({ variables: { claimId, approve, reason } });
    await refetch();
    return result?.resolveAnimalClaim ?? null;
  };

  const cancelClaim = async (claimId: string) => {
    const { data: result } = await cancelMutation({ variables: { claimId } });
    await refetch();
    return result?.cancelAnimalClaim ?? null;
  };

  return {
    claims: data?.animalClaims ?? [],
    loading,
    refetch,
    resolveClaim,
    resolving,
    cancelClaim,
    cancelling,
  };
}

export function useCreateAnimalClaim() {
  const [mutate, { loading }] = useMutation<
    { createAnimalClaim: { id: string; status: string } },
    CreateAnimalClaimVariables
  >(CREATE_ANIMAL_CLAIM_MUTATION, { refetchQueries: [GET_ANIMAL_CLAIMS_QUERY] });

  const createClaim = async (variables: CreateAnimalClaimVariables) => {
    const { data } = await mutate({ variables });
    return data?.createAnimalClaim ?? null;
  };

  return { createClaim, loading };
}
