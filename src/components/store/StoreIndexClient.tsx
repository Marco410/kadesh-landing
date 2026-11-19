'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';
import { LoadingBar } from 'kadesh/components/ui/skeleton';
import {
  DEFAULT_STORE_FILTERS,
  STORE_SEARCH_DEBOUNCE_MS,
  STORE_SEARCH_MIN_LENGTH,
  STORE_SELLER_OPTIONS,
  STORE_SORT_OPTIONS,
} from './constants';
import ProductCard from './ProductCard';
import { STORE_CATALOG_QUERY, type StoreCatalogResponse, type StoreCatalogVariables } from './queries';
import { hasStoreFilters, storeCatalogInput, storeListingHref } from './searchParams';
import { StoreWishlistProvider } from './StoreWishlist';
import type { StoreCatalog, StoreFacets, StoreFilters, StoreItem, StoreSeller, StoreSort } from './types';

const selectClass =
  'min-h-11 w-full rounded-xl border border-[#d8dee8] bg-white px-3 text-sm font-medium text-[#121212] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] sm:w-auto';

function chipClass(active: boolean) {
  return cn(
    'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
    active
      ? 'border-kadesh bg-kadesh text-white'
      : 'border-[#dcdcdc] bg-white text-[#3a3a3a] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
  );
}

/**
 * Filters and grid of `/tienda`. The first page comes from the server; changing a filter changes
 * the URL and the server paints again. Only «Ver más» asks from the browser.
 */
export default function StoreIndexClient({
  initialCatalog,
  facets,
  filters,
}: {
  initialCatalog: StoreCatalog;
  facets: StoreFacets;
  filters: StoreFilters;
}) {
  const router = useRouter();
  const client = useApolloClient();
  const [items, setItems] = useState<StoreItem[]>(initialCatalog.items);
  const [total, setTotal] = useState(initialCatalog.total);
  const [search, setSearch] = useState(filters.search);
  const [navigating, setNavigating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New filters: the server sent another first page.
  useEffect(() => {
    setItems(initialCatalog.items);
    setTotal(initialCatalog.total);
    setNavigating(false);
    setError(null);
  }, [initialCatalog]);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  const applyFilters = (patch: Partial<StoreFilters>) => {
    const next = { ...filters, ...patch };
    setNavigating(true);
    router.replace(storeListingHref(next), { scroll: false });
  };

  // One navigation per pause in typing, not per key.
  const onSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const term = value.trim();
      const effective = term.length >= STORE_SEARCH_MIN_LENGTH ? term : '';
      if (effective !== filters.search) applyFilters({ search: effective });
    }, STORE_SEARCH_DEBOUNCE_MS);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const { data } = await client.query<StoreCatalogResponse, StoreCatalogVariables>({
        query: STORE_CATALOG_QUERY,
        variables: { input: storeCatalogInput(filters, items.length) },
        fetchPolicy: 'network-only',
      });
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...data.storeCatalog.items.filter((item) => !seen.has(item.id))];
      });
      setTotal(data.storeCatalog.total);
    } catch {
      setError('No pudimos cargar más productos. Intenta de nuevo.');
    } finally {
      setLoadingMore(false);
    }
  };

  const topCategories = facets.categories.filter((category) => !category.parentSlug);
  const activeCategory = facets.categories.find((category) => category.slug === filters.category) ?? null;
  // Children of the open top-level category (or of the parent of the open child).
  const parentSlug = activeCategory ? activeCategory.parentSlug ?? activeCategory.slug : null;
  const childCategories = parentSlug
    ? facets.categories.filter((category) => category.parentSlug === parentSlug)
    : [];
  const filtered = hasStoreFilters(filters);

  return (
    <StoreWishlistProvider>
      <div
        role="search"
        aria-label="Filtrar productos"
        className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Buscar
            <span className="relative block">
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#5a5a5a] dark:text-[#9aa3b2]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Croquetas, collar, juguete…"
                maxLength={80}
                className="min-h-11 w-full rounded-xl border border-[#d8dee8] bg-white pr-3 pl-10 text-sm font-medium text-[#121212] placeholder:font-normal placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6]"
              />
            </span>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Quién vende
            <select
              className={selectClass}
              value={filters.seller ?? ''}
              onChange={(event) => applyFilters({ seller: (event.target.value || null) as StoreSeller | null })}
            >
              {STORE_SELLER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {facets.brands.length > 1 ? (
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
              Marca
              <select
                className={selectClass}
                value={filters.brand ?? ''}
                onChange={(event) => applyFilters({ brand: event.target.value || null })}
              >
                <option value="">Todas</option>
                {facets.brands.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name} ({brand.count})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Ordenar
            <select
              className={selectClass}
              value={filters.sort}
              onChange={(event) => applyFilters({ sort: event.target.value as StoreSort })}
            >
              {STORE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {topCategories.length > 0 ? (
          <div role="group" aria-label="Categoría" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              aria-pressed={!filters.category}
              onClick={() => applyFilters({ category: null })}
              className={chipClass(!filters.category)}
            >
              Todo
            </button>
            {topCategories.map((category) => {
              const active = parentSlug === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyFilters({ category: active && !activeCategory?.parentSlug ? null : category.slug })}
                  className={chipClass(active)}
                >
                  {category.name}
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={filters.onSale}
              onClick={() => applyFilters({ onSale: !filters.onSale })}
              className={chipClass(filters.onSale)}
            >
              En oferta
            </button>
          </div>
        ) : null}
        {childCategories.length > 0 ? (
          <div role="group" aria-label="Subcategoría" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {childCategories.map((category) => {
              const active = filters.category === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyFilters({ category: active ? parentSlug : category.slug })}
                  className={chipClass(active)}
                >
                  {category.name}
                  <span className={active ? 'text-white/80' : 'text-[#5a5a5a] dark:text-[#9aa3b2]'}>({category.count})</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <LoadingBar active={navigating} className="w-full" />
      </div>

      <p className="mb-4 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]" aria-live="polite">
        {navigating
          ? 'Buscando productos…'
          : total === 0
            ? 'Sin productos con estos filtros.'
            : `${total.toLocaleString('es-MX')} ${total === 1 ? 'producto' : 'productos'}`}
      </p>

      {items.length > 0 ? (
        <div
          className={cn(
            'grid grid-cols-2 gap-4 transition-opacity duration-200 sm:gap-6 md:grid-cols-3 lg:grid-cols-4',
            navigating && 'opacity-50',
          )}
        >
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#d8dee8] px-6 py-14 text-center dark:border-white/15">
          <p className="mb-2 text-lg font-bold text-[#121212] dark:text-white">
            {filtered ? 'No encontramos productos con estos filtros' : 'Todavía no hay productos'}
          </p>
          <p className="mb-6 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">
            {filtered
              ? 'Prueba con otra palabra o quita algún filtro.'
              : 'Estamos eligiendo los primeros productos. Vuelve pronto.'}
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                applyFilters({ ...DEFAULT_STORE_FILTERS });
              }}
              className="inline-flex min-h-12 items-center rounded-xl border border-[#d8dee8] px-6 font-semibold text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white"
            >
              Quitar filtros
            </button>
          ) : null}
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-6 text-center text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {items.length > 0 && items.length < total ? (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex min-h-12 items-center rounded-xl border border-[#d8dee8] px-6 font-semibold text-[#121212] hover:border-kadesh disabled:opacity-50 dark:border-white/15 dark:text-white"
          >
            {loadingMore ? 'Cargando…' : 'Ver más productos'}
          </button>
        </div>
      ) : null}
    </StoreWishlistProvider>
  );
}
