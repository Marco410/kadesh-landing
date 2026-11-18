'use client';

import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import ReportCard from './ReportCard';
import { PUBLIC_USER_REPORTS_QUERY } from './queries';
import type { PublicUserReport } from './types';

const PAGE = 12;

/**
 * Reportes del perfil público: los primeros 12 llegan del servidor; «Ver más» pide los siguientes
 * (`publicUserReports`) solo cuando se toca.
 */
export default function ProfileReports({
  username,
  initial,
  total,
}: {
  username: string;
  initial: PublicUserReport[];
  total: number;
}) {
  const client = useApolloClient();
  const [reports, setReports] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasMore = reports.length < total;

  const loadMore = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const result = await client.query<{ publicUserReports: PublicUserReport[] }>({
        query: PUBLIC_USER_REPORTS_QUERY,
        variables: { username, take: PAGE, skip: reports.length },
        fetchPolicy: 'network-only',
      });
      setReports((prev) => [...prev, ...(result.data?.publicUserReports ?? [])]);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {reports.map((report) => (
          <li key={report.id} className="flex min-w-0">
            <ReportCard report={report} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="inline-flex min-h-11 items-center rounded-full border border-[#d9dde3] bg-white px-5 text-sm font-semibold text-[#121212] hover:bg-[#f7f8fa] disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white"
          >
            {loading ? 'Cargando…' : `Ver más reportes (${total - reports.length})`}
          </button>
          {failed ? <p className="text-sm text-red-600 dark:text-red-400">No pudimos cargar más. Intenta de nuevo.</p> : null}
        </div>
      ) : null}
    </>
  );
}
