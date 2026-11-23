import type { Metadata } from 'next';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { isStoreVariantView } from './searchParams';
import type { StoreFilters, StoreItem, StoreProduct } from './types';

const LISTING_TITLE = 'Tienda Kadesh Pet: productos para tu mascota';
const LISTING_DESCRIPTION =
  'Alimento, accesorios y cuidado para tu mascota, elegidos por el equipo de Kadesh. Algunos los vende Kadesh y otros te llevan a Mercado Libre.';

/** `/tienda`. Filtered or re-sorted views point their canonical at the clean listing and stay out of the index. */
export function buildStoreListingMetadata(filters: StoreFilters): Metadata {
  const url = `${SITE_URL}${Routes.store.index}`;
  return {
    title: LISTING_TITLE,
    description: LISTING_DESCRIPTION,
    alternates: { canonical: url },
    robots: isStoreVariantView(filters) ? { index: false, follow: true } : undefined,
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
  // Uploaded photos expire in 1 h: the card points at `/tienda/<slug>/og`, which serves the current one.
  const images = productHasImage(product) ? [{ url: productImageUrl(product), alt: product.item.name }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'es_MX', images },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description },
  };
}

function productHasImage(product: StoreProduct): boolean {
  return Boolean(product.images[0]?.url || product.item.coverUrl);
}

function productImageUrl(product: StoreProduct): string {
  return `${SITE_URL}${Routes.store.productImage(product.item.slug)}`;
}

const LISTING_URL = `${SITE_URL}${Routes.store.index}`;

/** `/tienda` without filters: the page, its first products and the breadcrumb. */
export function buildStoreListingJsonLd(items: StoreItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${LISTING_URL}#page`,
        name: LISTING_TITLE,
        description: LISTING_DESCRIPTION,
        url: LISTING_URL,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}${Routes.store.product(item.slug)}`,
            name: item.name,
          })),
        },
      },
      storeBreadcrumb(),
    ],
  };
}

function storeBreadcrumb(product?: { name: string; url: string }): Record<string, unknown> {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Tienda', item: LISTING_URL },
  ];
  if (product) items.push({ '@type': 'ListItem', position: 3, name: product.name, item: product.url });
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

export function buildMissingProductMetadata(): Metadata {
  return { title: 'Producto no disponible | Tienda Kadesh Pet', robots: { index: false, follow: true } };
}

/**
 * schema.org Product plus the breadcrumb. The offer (price, availability) only goes on products
 * Kadesh sells; an affiliate product is sold by Mercado Libre at a price that is only approximate
 * here. Stars only when there are reviews written on Kadesh. Google rejects a Product with neither
 * offer nor stars, so an affiliate product without reviews only gets the breadcrumb.
 */
export function buildProductJsonLd(product: StoreProduct): Record<string, unknown> {
  const { item } = product;
  const url = `${SITE_URL}${Routes.store.product(item.slug)}`;
  const breadcrumb = storeBreadcrumb({ name: item.name, url });
  if (item.seller !== 'kadesh' && item.ratingCount === 0) {
    return { '@context': 'https://schema.org', ...breadcrumb };
  }
  const data: Record<string, unknown> = {
    '@type': 'Product',
    name: item.name,
    url,
    image: productHasImage(product) ? [productImageUrl(product)] : undefined,
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
      shippingDetails: shippingDetails(product),
      hasMerchantReturnPolicy: returnPolicy(product),
    };
  }
  return { '@context': 'https://schema.org', '@graph': [data, breadcrumb] };
}

/** Shipping to Mexico for one piece: the flat rate, or 0 when the price alone reaches free shipping. */
function shippingDetails(product: StoreProduct): Record<string, unknown> {
  const { priceCents, currency } = product.item;
  const free =
    product.shippingFlatCents === 0 ||
    (product.freeShippingMinCents > 0 && priceCents >= product.freeShippingMinCents);
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: free ? '0' : (product.shippingFlatCents / 100).toFixed(2),
      currency,
    },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' },
  };
}

/**
 * Returns only for a defective, damaged or wrong product, reported within `returnDays` of delivery;
 * the buyer pays the shipping back (the rule lives in kadesh-back, `STORE_RETURN_DAYS`).
 */
function returnPolicy(product: StoreProduct): Record<string, unknown> {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'MX',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: product.returnDays,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  };
}
