'use client';

import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import DonationIcon from 'kadesh/components/shared/icons/DonationIcon';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import { DONATION_CTA_LABEL, DONATION_WALL_PAGE, patitasLabel } from '../constants';
import DonateTrigger from '../DonateTrigger';
import { DONATION_WALL_QUERY } from '../queries';
import type { DonationWallEntry, DonationWallPage } from '../types';

const DAY = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' });

export function DonationWallCard({ entry, className = '' }: { entry: DonationWallEntry; className?: string }) {
  return (
    <li className={`rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised ${className}`}>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kadesh/10 text-kadesh">
          <DonationIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#121212] dark:text-[#eef1f6]">
            <strong className="font-semibold">{entry.displayName}</strong> dio{' '}
            <strong className="font-semibold text-kadesh">{patitasLabel(entry.unitCount)}</strong>
          </p>
          {entry.message ? (
            <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
              {entry.message}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            <time dateTime={entry.paidAt}>{DAY.format(new Date(entry.paidAt))}</time>
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * Wall of patitas: latest donations with their message. The first page comes from the server;
 * «Ver más» asks for the next 20 (only on click).
 */
export default function DonationWall({ initial }: { initial: DonationWallPage }) {
  const client = useApolloClient();
  const [items, setItems] = useState(initial.items);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query<{ donationWall: DonationWallPage }>({
        query: DONATION_WALL_QUERY,
        variables: { take: DONATION_WALL_PAGE, skip: items.length },
        fetchPolicy: 'network-only',
      });
      const page = data?.donationWall;
      if (page) {
        setItems((current) => {
          const seen = new Set(current.map((item) => item.id));
          return [...current, ...page.items.filter((item) => !seen.has(item.id))];
        });
        setHasMore(page.hasMore);
      }
    } catch (err) {
      setError(friendlyErrorText(err, 'No pudimos cargar más mensajes. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-kadesh/30 bg-white p-8 text-center dark:bg-night-raised">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-kadesh/10 text-kadesh">
          <DonationIcon size={26} />
        </span>
        <p className="max-w-sm text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
          Aún no hay patitas en el muro. La tuya puede ser la primera.
        </p>
        <DonateTrigger
          source="donations_page"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-kadesh px-5 font-semibold text-white hover:bg-kadesh-600"
        >
          <DonationIcon size={16} />
          {DONATION_CTA_LABEL}
        </DonateTrigger>
      </div>
    );
  }

  return (
    <div>
      {/* Columns like a corkboard: short and long messages pack without gaps. */}
      <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {items.map((entry) => (
          <DonationWallCard key={entry.id} entry={entry} className="mb-3 break-inside-avoid" />
        ))}
      </ul>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-6 font-semibold text-kadesh hover:bg-kadesh/5 disabled:opacity-60"
          >
            {loading ? 'Cargando…' : 'Ver más mensajes'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
