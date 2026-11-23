import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from 'kadesh/components/blog/JsonLd';
import StoreListingPage, { loadStoreListing } from 'kadesh/components/store/StoreListingPage';
import { isStoreVariantView, parseStoreSearchParams } from 'kadesh/components/store/searchParams';
import { buildStoreListingJsonLd, buildStoreListingMetadata } from 'kadesh/components/store/store-seo';

// Product photos have a URL signed for 1 h: this stays well below that.
export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return buildStoreListingMetadata(parseStoreSearchParams(await searchParams));
}

/** `/tienda`: the store catalog. 404 while the store is closed (`STORE_ENABLED` off in kadesh-back). */
export default async function StorePage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseStoreSearchParams(await searchParams);
  const { catalog, facets, top } = await loadStoreListing(filters);
  if (!facets.enabled) notFound();

  return (
    <>
      {/* Only the clean listing is indexed (filtered or re-sorted views are noindex). */}
      {isStoreVariantView(filters) ? null : <JsonLd data={buildStoreListingJsonLd(catalog.items)} />}
      <StoreListingPage filters={filters} catalog={catalog} facets={facets} top={top} />
    </>
  );
}
