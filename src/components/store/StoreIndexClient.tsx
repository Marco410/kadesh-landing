'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, FilterHorizontalIcon, Search01Icon } from '@hugeicons/core-free-icons';
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
import type { StoreCatalog, StoreFacetCategory, StoreFacets, StoreFilters, StoreItem, StoreSeller, StoreSort } from './types';

const selectClass =
  'min-h-11 rounded-xl border border-[#d8dee8] bg-white px-3 text-sm font-medium text-[#121212] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6]';

/** The right column stays in view while scrolling only when it fits: on a short screen the ad would never show. */
const STICKY_WHEN_TALL = '[@media(min-width:1280px)_and_(min-height:52rem)]:sticky [@media(min-width:1280px)_and_(min-height:52rem)]:top-24';

const groupTitleClass = 'mb-2 text-xs font-bold tracking-wide text-[#5a5a5a] uppercase dark:text-[#9aa3b2]';

/** A row of the left column: a filter you turn on by clicking (category, seller, brand). */
function optionClass(active: boolean, nested = false) {
  return cn(
    'flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kadesh',
    nested && 'pl-6',
    active
      ? 'bg-kadesh-50 font-semibold text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300'
      : 'text-[#3a3a3a] hover:bg-[#f3f5f8] dark:text-[#d0d0d0] dark:hover:bg-white/5',
  );
}

function Count({ value }: { value: number }) {
  return <span className="text-xs tabular-nums text-[#5a5a5a] dark:text-[#9aa3b2]">{value}</span>;
}

/**
 * Filters and grid of `/tienda`. The first page comes from the server; changing a filter changes
 * the URL and the server paints again. Only «Ver más» asks from the browser.
 *
 * Layout: filters in a left column (`lg`+; a «Filtros» button opens them on phones), sort above the
 * products, and `aside` («Los más vendidos» and the ad) on the right from `xl`, under the products
 * before that.
 */
export default function StoreIndexClient({
  initialCatalog,
  facets,
  filters,
  aside,
  affiliateNote = false,
}: {
  initialCatalog: StoreCatalog;
  facets: StoreFacets;
  filters: StoreFilters;
  aside?: ReactNode;
  /** Some product of the page is sold on Mercado Libre: say what the affiliate link means. */
  affiliateNote?: boolean;
}) {
  const router = useRouter();
  const client = useApolloClient();
  const [items, setItems] = useState<StoreItem[]>(initialCatalog.items);
  const [total, setTotal] = useState(initialCatalog.total);
  const [search, setSearch] = useState(filters.search);
  const [navigating, setNavigating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  // The open top-level category (itself, or the parent of the open child).
  const parentSlug = activeCategory ? activeCategory.parentSlug ?? activeCategory.slug : null;
  const childrenOf = (slug: string) => facets.categories.filter((category) => category.parentSlug === slug);
  // The API counts each product in its own category: a parent adds its children.
  const countOf = (category: StoreFacetCategory) =>
    category.count + childrenOf(category.slug).reduce((sum, child) => sum + child.count, 0);
  const filtered = hasStoreFilters(filters);
  const activeFilters =
    (filters.category ? 1 : 0) + (filters.brand ? 1 : 0) + (filters.seller ? 1 : 0) + (filters.onSale ? 1 : 0);

  const clearAll = () => {
    setSearch('');
    applyFilters({ ...DEFAULT_STORE_FILTERS, sort: filters.sort });
  };

  const sortControl = (
    <label className="flex items-center gap-2 text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
      <span className="hidden sm:inline">Ordenar</span>
      <select
        aria-label="Ordenar productos"
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
  );

  return (
    <StoreWishlistProvider>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_20rem]">
        {/* Left: search and filters. On phones, behind «Filtros». */}
        <div className="flex flex-col gap-3 lg:contents">
          <div className="flex gap-2 lg:hidden">
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="tienda-filtros"
              onClick={() => setFiltersOpen((open) => !open)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8dee8] px-4 text-sm font-semibold text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white"
            >
              <HugeiconsIcon icon={filtersOpen ? Cancel01Icon : FilterHorizontalIcon} size={18} aria-hidden="true" />
              Filtros{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </button>
            <div className="ml-auto">{sortControl}</div>
          </div>

          <div
            id="tienda-filtros"
            role="search"
            aria-label="Filtrar productos"
            className={cn(
              'flex-col gap-6 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:-m-1 lg:border-0 lg:bg-transparent lg:p-1 lg:dark:bg-transparent',
              filtersOpen ? 'flex' : 'hidden',
            )}
          >
            <label className="flex flex-col gap-1">
              <span className="sr-only">Buscar productos</span>
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
                  placeholder="Buscar: croquetas, collar…"
                  maxLength={80}
                  className="min-h-11 w-full rounded-xl border border-[#d8dee8] bg-white pr-3 pl-10 text-sm font-medium text-[#121212] placeholder:font-normal placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6]"
                />
              </span>
            </label>

            {topCategories.length > 0 ? (
              <div role="group" aria-labelledby="tienda-filtro-categoria">
                <p id="tienda-filtro-categoria" className={groupTitleClass}>
                  Categorías
                </p>
                <ul className="flex flex-col gap-0.5">
                  <li>
                    <button
                      type="button"
                      aria-pressed={!filters.category}
                      onClick={() => applyFilters({ category: null })}
                      className={optionClass(!filters.category)}
                    >
                      Todo
                      <Count value={facets.total} />
                    </button>
                  </li>
                  {topCategories.map((category) => {
                    const open = parentSlug === category.slug;
                    const children = childrenOf(category.slug);
                    return (
                      <li key={category.slug}>
                        <button
                          type="button"
                          aria-pressed={filters.category === category.slug}
                          aria-expanded={children.length > 0 ? open : undefined}
                          onClick={() => applyFilters({ category: category.slug })}
                          className={optionClass(filters.category === category.slug)}
                        >
                          {category.name}
                          <Count value={countOf(category)} />
                        </button>
                        {open && children.length > 0 ? (
                          <ul className="mt-0.5 flex flex-col gap-0.5">
                            {children.map((child) => (
                              <li key={child.slug}>
                                <button
                                  type="button"
                                  aria-pressed={filters.category === child.slug}
                                  onClick={() =>
                                    applyFilters({ category: filters.category === child.slug ? category.slug : child.slug })
                                  }
                                  className={optionClass(filters.category === child.slug, true)}
                                >
                                  {child.name}
                                  <Count value={child.count} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] dark:text-[#d0d0d0] dark:hover:bg-white/5">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={() => applyFilters({ onSale: !filters.onSale })}
                className="size-4 accent-kadesh"
              />
              Solo en oferta
            </label>

            <div role="radiogroup" aria-labelledby="tienda-filtro-vendedor">
              <p id="tienda-filtro-vendedor" className={groupTitleClass}>
                Quién vende
              </p>
              <ul className="flex flex-col gap-0.5">
                {STORE_SELLER_OPTIONS.map((option) => {
                  const active = (filters.seller ?? '') === option.value;
                  return (
                    <li key={option.value || 'all'}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => applyFilters({ seller: (option.value || null) as StoreSeller | null })}
                        className={optionClass(active)}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {facets.brands.length > 1 ? (
              <div role="radiogroup" aria-labelledby="tienda-filtro-marca">
                <p id="tienda-filtro-marca" className={groupTitleClass}>
                  Marca
                </p>
                <ul className="flex flex-col gap-0.5">
                  <li>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!filters.brand}
                      onClick={() => applyFilters({ brand: null })}
                      className={optionClass(!filters.brand)}
                    >
                      Todas
                    </button>
                  </li>
                  {facets.brands.map((brand) => (
                    <li key={brand.slug}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={filters.brand === brand.slug}
                        onClick={() => applyFilters({ brand: brand.slug })}
                        className={optionClass(filters.brand === brand.slug)}
                      >
                        {brand.name}
                        <Count value={brand.count} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {filtered ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d8dee8] px-4 text-sm font-semibold text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white"
              >
                Quitar filtros
              </button>
            ) : null}
          </div>
        </div>

        {/* Center: products. */}
        <section aria-label="Productos" className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]" aria-live="polite">
              {navigating
                ? 'Buscando productos…'
                : total === 0
                  ? 'Sin productos con estos filtros.'
                  : `${total.toLocaleString('es-MX')} ${total === 1 ? 'producto' : 'productos'}`}
            </p>
            <div className="hidden lg:block">{sortControl}</div>
          </div>
          <LoadingBar active={navigating} className="mb-4 w-full" />

          {items.length > 0 ? (
            <div
              className={cn(
                // With the right column (`xl`) the center is narrower: two columns until there is room for three.
                'grid grid-cols-2 gap-4 transition-opacity duration-200 sm:gap-5 md:grid-cols-3 [@media(min-width:1280px)_and_(max-width:1359.98px)]:grid-cols-2',
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
                  onClick={clearAll}
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

          {affiliateNote ? (
            <p className="mt-10 max-w-3xl text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              Los productos marcados «En Mercado Libre» llevan un enlace de afiliado: si compras, Kadesh recibe una comisión
              de Mercado Libre sin costo extra para ti.
            </p>
          ) : null}
        </section>

        {/* Right: «Los más vendidos» and the ad. Under the products before `xl`. */}
        {aside ? (
          <div className={cn('min-w-0 lg:col-start-2 xl:col-start-auto xl:self-start', STICKY_WHEN_TALL)}>{aside}</div>
        ) : null}
      </div>
    </StoreWishlistProvider>
  );
}
