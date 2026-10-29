"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  FIND_ANIMAL_REPORT_DUPLICATES,
  type FindSimilarReportsResponse,
  type FindSimilarReportsVariables,
  type SimilarReport,
} from 'kadesh/components/animals/queries';

const DEBOUNCE_MS = 600;

/**
 * Revisa mientras se llena el reporte si ya hay uno parecido (o del otro lado: perdido ↔
 * encontrado). `input` en null apaga la revisión (p. ej. antes de elegir la ubicación).
 * La «huella» son las variables: si no cambian no se vuelve a consultar, y `reviewed` dice si la
 * persona ya vio esta lista (para no volver a frenarla al publicar).
 */
export function useSimilarReports(input: FindSimilarReportsVariables | null) {
  const [run] = useLazyQuery<FindSimilarReportsResponse, FindSimilarReportsVariables>(
    FIND_ANIMAL_REPORT_DUPLICATES,
    { fetchPolicy: 'network-only' }
  );
  const [result, setResult] = useState<{ key: string; reports: SimilarReport[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewedKey, setReviewedKey] = useState<string | null>(null);
  const key = input ? JSON.stringify(input) : null;
  const inputRef = useRef(input);
  inputRef.current = input;

  const fetchReports = useCallback(
    async (variables: FindSimilarReportsVariables, fingerprint: string) => {
      const { data, error } = await run({ variables });
      if (error) throw error;
      const reports = data?.findAnimalReportDuplicates ?? [];
      setResult({ key: fingerprint, reports });
      return reports;
    },
    [run]
  );

  useEffect(() => {
    const variables = inputRef.current;
    if (!variables || !key || result?.key === key) return;
    const handle = window.setTimeout(() => {
      setLoading(true);
      fetchReports(variables, key)
        .catch((error) => console.error('[animal] no se pudieron revisar reportes parecidos', error))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
    // Solo cuando cambia la huella.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /** Para «Publicar»: lo ya consultado si la huella no cambió; si no, consulta en ese momento. */
  const ensure = useCallback(async (): Promise<SimilarReport[]> => {
    const variables = inputRef.current;
    if (!variables || !key) return [];
    if (result?.key === key) return result.reports;
    return fetchReports(variables, key);
  }, [fetchReports, key, result]);

  const markReviewed = useCallback(() => setReviewedKey(key), [key]);

  return {
    reports: result && result.key === key ? result.reports : [],
    loading,
    ensure,
    reviewed: key !== null && reviewedKey === key,
    markReviewed,
  };
}
