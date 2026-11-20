import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { fetchStoreBestSellers, fetchStoreCatalog, fetchStoreFacets } from './server';
import StoreAside from './StoreAside';
import StoreIndexClient from './StoreIndexClient';
import type { StoreCatalog, StoreFacets, StoreFilters, StoreItem } from './types';

type StoreTop = { kind: 'best_selling' | 'newest'; items: StoreItem[] };

/** Data of the listing (the page and its metadata ask for it; `fetch` shares it within a request). */
export async function loadStoreListing(
  filters: StoreFilters,
): Promise<{ catalog: StoreCatalog; facets: StoreFacets; top: StoreTop }> {
  const [catalog, facets, top] = await Promise.all([
    fetchStoreCatalog(filters),
    fetchStoreFacets(),
    fetchStoreBestSellers(),
  ]);
  return { catalog, facets, top };
}

/**
 * `/tienda`: painted by the server; the filters and «Ver más» are handled by `StoreIndexClient`.
 * Three columns on wide screens: filters, products, and «Los más vendidos» with the ad block.
 */
export default function StoreListingPage({
  filters,
  catalog,
  facets,
  top,
}: {
  filters: StoreFilters;
  catalog: StoreCatalog;
  facets: StoreFacets;
  top: StoreTop;
}) {
  const hasAffiliate = catalog.items.some((item) => item.seller === 'mercado_libre');

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Navigation />

      <header className="bg-kadesh-50 px-4 pt-28 pb-8 dark:bg-kadesh/10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
              Tienda
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl">
              Productos para tu mascota
            </h1>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] lg:text-right">
            Alimento, accesorios y cuidado, elegidos por el equipo de Kadesh. Algunos los vende Kadesh y otros te llevan a
            Mercado Libre. Las estrellas son de personas que los calificaron aquí.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-8 pb-20 sm:px-6 lg:px-8">
        <StoreIndexClient
          initialCatalog={catalog}
          facets={facets}
          filters={filters}
          aside={<StoreAside kind={top.kind} items={top.items} />}
          affiliateNote={hasAffiliate}
        />
      </main>

      <Footer />
    </div>
  );
}
