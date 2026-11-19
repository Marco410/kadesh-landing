import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from 'kadesh/components/blog/JsonLd';
import ProductDetail from 'kadesh/components/store/ProductDetail';
import { fetchStoreProduct, fetchStoreReviews } from 'kadesh/components/store/server';
import {
  buildMissingProductMetadata,
  buildProductJsonLd,
  buildProductMetadata,
} from 'kadesh/components/store/store-seo';

// Product photos have a URL signed for 1 h: this stays well below that.
export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  return product ? buildProductMetadata(product) : buildMissingProductMetadata();
}

/** Page of a product. 404 when it is not for sale (or the store is closed). */
export default async function StoreProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await fetchStoreProduct(slug);
  if (!product) notFound();
  const reviews = await fetchStoreReviews(product.item.id);

  return (
    <>
      <JsonLd data={buildProductJsonLd(product)} />
      <ProductDetail product={product} reviews={reviews} />
    </>
  );
}
