'use client';

import { useEffect, useSyncExternalStore } from 'react';
import StoreStars from './StoreStars';

/**
 * The stars at the top of a product page. The page is cached (up to a minute or two), but the
 * reviews section below gets the current stars when the person signs in or writes a review: it
 * publishes them here and this header follows. No request of its own.
 */

type Stars = { average: number; count: number };

const latest = new Map<string, Stars>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Called by the reviews section with the stars the server just answered. */
export function publishProductStars(productId: string, stars: Stars) {
  const current = latest.get(productId);
  if (current && current.average === stars.average && current.count === stars.count) return;
  latest.set(productId, stars);
  listeners.forEach((listener) => listener());
}

/** Keeps the header in step with the reviews section's stars. */
export function usePublishProductStars(productId: string, average: number, count: number) {
  useEffect(() => {
    publishProductStars(productId, { average, count });
  }, [productId, average, count]);
}

export default function LiveStoreStars({
  productId,
  average,
  count,
  size,
  className,
}: {
  productId: string;
  average: number;
  count: number;
  size?: number;
  className?: string;
}) {
  const live = useSyncExternalStore(
    subscribe,
    () => latest.get(productId) ?? null,
    () => null,
  );
  return <StoreStars average={live?.average ?? average} count={live?.count ?? count} size={size} className={className} />;
}
