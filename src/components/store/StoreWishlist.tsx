'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import {
  MY_STORE_WISHLIST_IDS_QUERY,
  SET_STORE_WISHLIST_MUTATION,
  type MyStoreWishlistIdsResponse,
  type SetStoreWishlistResponse,
} from './queries';

type WishlistContextValue = {
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => void;
  busyId: string | null;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Wishlist state for every product on a page. With a session it asks once for all the saved ids
 * (one query however many cards there are); without one, the heart sends to the login.
 */
export function StoreWishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { data } = useQuery<MyStoreWishlistIdsResponse>(MY_STORE_WISHLIST_IDS_QUERY, {
    skip: !user?.id,
    fetchPolicy: 'cache-first',
  });
  const [setWishlist] = useMutation<SetStoreWishlistResponse>(SET_STORE_WISHLIST_MUTATION);
  // What the person changed on this page, on top of what the server said.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const saved = useMemo(() => new Set(data?.myStoreWishlistIds ?? []), [data]);

  const isSaved = useCallback(
    (productId: string) => (productId in overrides ? overrides[productId] : saved.has(productId)),
    [overrides, saved],
  );

  const toggle = useCallback(
    (productId: string) => {
      if (!user?.id) {
        router.push(`${Routes.auth.login}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      const next = !isSaved(productId);
      setOverrides((current) => ({ ...current, [productId]: next }));
      setBusyId(productId);
      setWishlist({ variables: { productId, saved: next } })
        .then(({ data: result }) => {
          const outcome = result?.setStoreWishlist;
          if (!outcome?.success) {
            setOverrides((current) => ({ ...current, [productId]: !next }));
            sileo.error({ title: outcome?.message ?? 'No pudimos guardar el producto.' });
            return;
          }
          setOverrides((current) => ({ ...current, [productId]: outcome.saved }));
        })
        .catch(() => {
          setOverrides((current) => ({ ...current, [productId]: !next }));
          sileo.error({ title: 'No pudimos guardar el producto. Intenta de nuevo.' });
        })
        .finally(() => setBusyId(null));
    },
    [isSaved, pathname, router, setWishlist, user?.id],
  );

  const value = useMemo(() => ({ isSaved, toggle, busyId }), [busyId, isSaved, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/**
 * Heart of a product. `variant="icon"` floats over the photo of a card; `variant="button"` is the
 * labelled one of the product page. Renders nothing outside a `StoreWishlistProvider`.
 */
export function StoreWishlistButton({
  productId,
  productName,
  variant = 'icon',
  className,
}: {
  productId: string;
  productName: string;
  variant?: 'icon' | 'button';
  className?: string;
}) {
  const wishlist = useContext(WishlistContext);
  if (!wishlist) return null;
  const saved = wishlist.isSaved(productId);
  const label = saved ? `Quitar ${productName} de tu lista de deseos` : `Guardar ${productName} en tu lista de deseos`;

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={() => wishlist.toggle(productId)}
        disabled={wishlist.busyId === productId}
        aria-pressed={saved}
        className={cn(
          'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh disabled:opacity-60',
          saved
            ? 'border-kadesh bg-kadesh-50 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300'
            : 'border-[#d8dee8] text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white',
          className,
        )}
      >
        <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} aria-hidden />
        {saved ? 'En tu lista de deseos' : 'Guardar en mi lista'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => wishlist.toggle(productId)}
      disabled={wishlist.busyId === productId}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Quitar de tu lista de deseos' : 'Guardar en tu lista de deseos'}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full bg-white/95 shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh disabled:opacity-60 dark:bg-night/90',
        saved ? 'text-kadesh' : 'text-[#5a5a5a] hover:text-kadesh dark:text-[#d0d0d0]',
        className,
      )}
    >
      <HugeiconsIcon icon={FavouriteIcon} size={20} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} aria-hidden />
    </button>
  );
}
