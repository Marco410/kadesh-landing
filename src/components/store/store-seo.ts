import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { hasStoreFilters } from './searchParams';
import type { StoreFilters, StoreProduct } from './types';

const LISTING_TITLE = 'Tienda Kadesh Pet: productos para tu mascota';
const LISTING_DESCRIPTION =
  'Alimento, accesorios y cuidado para tu mascota, elegidos por el equipo de Kadesh. Algunos los vende Kadesh y otros te llevan a Mercado Libre.';

/** `/tienda`. Filtered views point their canonical at the clean listing and stay out of the index. */
export function buildStoreListingMetadata(filters: StoreFilters): Metadata {
  const url = `${SITE_URL}${Routes.store.index}`;
  return {
    title: LISTING_TITLE,
    description: LISTING_DESCRIPTION,
    alternates: { canonical: url },
    robots: hasStoreFilters(filters) ? { index: false, follow: true } : undefined,
    openGraph: { title: LISTING_TITLE, description: LISTING_DESCRIPTION, url, type: 'website', locale: 'es_MX' },
  };
}

function productDescription(product: StoreProduct): string {
  const text = product.metaDescription || product.item.shortDescription || product.description || '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 160);
}

export function buildProductMetadata(product: StoreProduct): Metadata {
  const title = product.metaTitle || `${product.item.name} | Tienda Kadesh Pet`;
  const description = productDescription(product) || LISTING_DESCRIPTION;
  const url = `${SITE_URL}${Routes.store.product(product.item.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    // No image here: uploaded photos have a URL that expires in 1 h, and a share card would keep it.
    openGraph: { title, description, url, type: 'website', locale: 'es_MX' },
  };
}

export function buildMissingProductMetadata(): Metadata {
  return { title: 'Producto no disponible | Tienda Kadesh Pet', robots: { index: false, follow: true } };
}

/**
 * schema.org Product. The offer (price, availability) only goes on products Kadesh sells; an
 * affiliate product is sold by Mercado Libre at a price that is only approximate here. Stars only
 * when there are reviews written on Kadesh.
 */
export function buildProductJsonLd(product: StoreProduct): Record<string, unknown> {
  const { item } = product;
  const url = `${SITE_URL}${Routes.store.product(item.slug)}`;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    url,
    description: productDescription(product) || undefined,
    brand: item.brand ? { '@type': 'Brand', name: item.brand.name } : undefined,
    category: item.category?.name,
  };
  if (item.ratingCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: item.ratingAverage,
      reviewCount: item.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (item.seller === 'kadesh') {
    data.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: item.currency,
      price: (item.priceCents / 100).toFixed(2),
      availability: item.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Kadesh Pet' },
    };
  }
  return data;
}
