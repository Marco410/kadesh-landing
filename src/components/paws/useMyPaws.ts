"use client";

import { useCallback, useEffect, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { PAW_HISTORY_PAGE } from "./constants";
import {
  MY_PAWS_QUERY,
  MY_PAW_HISTORY_QUERY,
  SET_PAW_RANKING_VISIBILITY_MUTATION,
} from "./queries";
import type {
  MyPawHistoryResponse,
  MyPawsResponse,
  PawHistoryEntry,
  SetPawRankingVisibilityResponse,
} from "./types";

/**
 * Huellitas de quien tiene sesión: una consulta al abrir la vista, más páginas del historial a
 * pedido y el cambio de visibilidad en el ranking (corrige la caché con la respuesta, sin volver
 * a pedir todo).
 */
export function useMyPaws(userId: string | undefined) {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery<MyPawsResponse>(MY_PAWS_QUERY, {
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });
  const paws = data?.myPaws ?? null;

  const [more, setMore] = useState<PawHistoryEntry[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPageFull, setLastPageFull] = useState<boolean | null>(null);

  // Si la primera página cambia (refetch), lo cargado después ya no encaja.
  const firstId = paws?.history[0]?.id ?? null;
  useEffect(() => {
    setMore([]);
    setLastPageFull(null);
  }, [firstId]);

  const history = paws ? [...paws.history, ...more] : [];
  const hasMore = lastPageFull ?? (paws?.history.length ?? 0) >= PAW_HISTORY_PAGE;

  const loadMore = useCallback(async () => {
    if (!paws || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await client.query<MyPawHistoryResponse>({
        query: MY_PAW_HISTORY_QUERY,
        variables: { take: PAW_HISTORY_PAGE, skip: paws.history.length + more.length },
        fetchPolicy: "network-only",
      });
      const page = result.data?.myPawHistory ?? [];
      setMore((prev) => [...prev, ...page]);
      setLastPageFull(page.length >= PAW_HISTORY_PAGE);
    } finally {
      setLoadingMore(false);
    }
  }, [client, paws, more.length, loadingMore]);

  const [setVisibility, { loading: savingVisibility }] = useMutation<SetPawRankingVisibilityResponse>(
    SET_PAW_RANKING_VISIBILITY_MUTATION,
    {
      update(cache, { data: result }) {
        const answer = result?.setPawRankingVisibility;
        if (!answer?.success || answer.rankingHidden == null) return;
        const hidden = answer.rankingHidden;
        cache.updateQuery<MyPawsResponse>({ query: MY_PAWS_QUERY }, (prev) =>
          prev?.myPaws
            ? { myPaws: { ...prev.myPaws, rankingHidden: hidden, rank: hidden ? null : prev.myPaws.rank } }
            : prev,
        );
      },
    },
  );

  const setRankingHidden = useCallback(
    async (hidden: boolean) => {
      const result = await setVisibility({ variables: { hidden } });
      const answer = result.data?.setPawRankingVisibility;
      if (!answer?.success) throw new Error(answer?.message || "No pudimos guardar el cambio.");
      return answer.message;
    },
    [setVisibility],
  );

  return {
    paws,
    history,
    hasMore,
    loading: loading && !paws,
    error: error && !paws ? error : null,
    refetch,
    loadMore,
    loadingMore,
    setRankingHidden,
    savingVisibility,
  };
}
