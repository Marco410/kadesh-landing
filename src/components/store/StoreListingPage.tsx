import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { fetchStoreCatalog, fetchStoreFacets } from './server';
import StoreIndexClient from './StoreIndexClient';
import type { StoreCatalog, StoreFacets, StoreFilters } from './types';

/** Data of the listing (the page and its metadata ask for it; `fetch` shares it within a request). */
export async function loadStoreListing(filters: StoreFilters): Promise<{ catalog: StoreCatalog; facets: StoreFacets }> {
  const [catalog, facets] = await Promise.all([fetchStoreCatalog(filters), fetchStoreFacets()]);
  return { catalog, facets };
}

/**
 * `/tienda`: painted by the server; the filters and «Ver más» are handled by `StoreIndexClient`.
 */
export default function StoreListingPage({
  filters,
  catalog,
  facets,
}: {
  filters: StoreFilters;
  catalog: StoreCatalog;
  facets: StoreFacets;
}) {
  const hasAffiliate = catalog.items.some((item) => item.seller === 'mercado_libre');

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Navigation />

      <header className="bg-kadesh-50 px-4 pt-32 pb-14 dark:bg-kadesh/10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
            Tienda
          </p>
          <h1 className="mb-4 max-w-3xl text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            Productos para tu mascota
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
            Alimento, accesorios y cuidado, elegidos por el equipo de Kadesh. Algunos los vende Kadesh y otros te llevan
            a Mercado Libre para comprarlos allá. Las estrellas son de personas que los calificaron aquí.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-8">
        <StoreIndexClient initialCatalog={catalog} facets={facets} filters={filters} />
        {hasAffiliate ? (
          <p className="mt-10 max-w-3xl text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Los productos marcados «En Mercado Libre» llevan un enlace de afiliado: si compras, Kadesh recibe una
            comisión de Mercado Libre sin costo extra para ti.
          </p>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
