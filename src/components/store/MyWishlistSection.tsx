'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Routes } from 'kadesh/core/routes';
import { STORE_WISHLIST_PAGE_SIZE } from './constants';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { MY_STORE_WISHLIST_QUERY, type MyStoreWishlistResponse } from './queries';
import { StoreWishlistProvider } from './StoreWishlist';

/**
 * Mi cuenta → Lista de deseos: the products the person saved, newest first. Asked once when the
 * view opens; taking one out only changes its heart (the list is not asked again).
 */
export default function MyWishlistSection() {
  const [loadingMore, setLoadingMore] = useState(false);
  const { data, loading, error, fetchMore } = useQuery<MyStoreWishlistResponse>(MY_STORE_WISHLIST_QUERY, {
    variables: { take: STORE_WISHLIST_PAGE_SIZE, skip: 0 },
    fetchPolicy: 'cache-and-network',
  });

  const items = data?.myStoreWishlist.items ?? [];
  const total = data?.myStoreWishlist.total ?? 0;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { take: STORE_WISHLIST_PAGE_SIZE, skip: items.length },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          const seen = new Set(previous.myStoreWishlist.items.map((item) => item.id));
          return {
            myStoreWishlist: {
              ...fetchMoreResult.myStoreWishlist,
              items: [
                ...previous.myStoreWishlist.items,
                ...fetchMoreResult.myStoreWishlist.items.filter((item) => !seen.has(item.id)),
              ],
            },
          };
        },
      });
    } finally {
      setLoadingMore(false);
    }
  };

  if (error && items.length === 0) {
    return (
      <p role="alert" className="rounded-3xl border border-dash-line bg-dash-surface p-6 text-dash-soft">
        No pudimos cargar tu lista de deseos. Recarga la página para intentar de nuevo.
      </p>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy="true" aria-label="Cargando tu lista de deseos">
        {[0, 1, 2].map((index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dash-line bg-dash-surface p-8 text-center">
        <p className="mb-2 text-lg font-semibold text-dash-ink">Todavía no guardas ningún producto</p>
        <p className="mx-auto mb-6 max-w-md text-dash-muted">
          Toca el corazón de un producto de la tienda y aquí lo tendrás a la mano.
        </p>
        <Link
          href={Routes.store.index}
          className="inline-flex min-h-12 items-center rounded-full bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <StoreWishlistProvider>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      {items.length < total ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex min-h-12 items-center rounded-full border border-dash-line-strong px-6 font-semibold text-dash-ink hover:border-kadesh disabled:opacity-50"
          >
            {loadingMore ? 'Cargando…' : 'Ver más'}
          </button>
        </div>
      ) : null}
    </StoreWishlistProvider>
  );
}
