import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import { DEFAULT_STORE_FILTERS } from './constants';
import ProductBuyBox from './ProductBuyBox';
import ProductCard from './ProductCard';
import ProductGallery from './ProductGallery';
import ProductReviews from './ProductReviews';
import { storeListingHref } from './searchParams';
import LiveStoreStars from './LiveStoreStars';
import { StoreWishlistProvider } from './StoreWishlist';
import type { StoreProduct, StoreReviews } from './types';

const crumbLinkClass = 'font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300';

/**
 * Product page: photos, price and action, description, reviews and related products. Painted by
 * the server; the gallery, the buy box and the reviews are the only client parts.
 */
export default function ProductDetail({ product, reviews }: { product: StoreProduct; reviews: StoreReviews }) {
  const { item } = product;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Navigation />

      <StoreWishlistProvider>
        <main className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <nav aria-label="Ruta" className="mb-6 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href={Routes.store.index} className={crumbLinkClass}>
                  Tienda
                </Link>
              </li>
              {item.category ? (
                <>
                  <li aria-hidden>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </li>
                  <li>
                    <Link
                      href={storeListingHref({ ...DEFAULT_STORE_FILTERS, category: item.category.slug })}
                      className={crumbLinkClass}
                    >
                      {item.category.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </li>
              <li aria-current="page" className="line-clamp-1">
                {item.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <ProductGallery images={product.images} productName={item.name} />

            <div className="flex flex-col gap-5">
              <div>
                {item.brand ? (
                  <p className="mb-1 text-sm font-semibold tracking-wide text-[#5a5a5a] uppercase dark:text-[#9aa3b2]">
                    {item.brand.name}
                  </p>
                ) : null}
                <h1 className="text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl">
                  {item.name}
                </h1>
                <a href="#resenas" className="mt-3 inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh">
                  <LiveStoreStars productId={item.id} average={item.ratingAverage} count={item.ratingCount} size={18} />
                </a>
              </div>
              {item.shortDescription ? (
                <p className="text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{item.shortDescription}</p>
              ) : null}
              <ProductBuyBox item={item} variants={product.variants} />
            </div>
          </div>

          {product.description ? (
            <section aria-labelledby="descripcion-titulo" className="mt-16 max-w-3xl">
              <h2 id="descripcion-titulo" className="mb-4 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
                Descripción
              </h2>
              <p className="whitespace-pre-line text-lg leading-relaxed text-[#3a3a3a] [overflow-wrap:anywhere] dark:text-[#d0d0d0]">
                {product.description}
              </p>
            </section>
          ) : null}

          <div className="mt-16">
            <ProductReviews
              productId={item.id}
              productName={item.name}
              initial={reviews}
              initialAverage={item.ratingAverage}
              initialCount={item.ratingCount}
              initialBreakdown={product.ratingBreakdown}
            />
          </div>

          {product.related.length > 0 ? (
            <section aria-labelledby="relacionados-titulo" className="mt-16">
              <h2 id="relacionados-titulo" className="mb-6 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
                También te puede interesar
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {product.related.slice(0, 4).map((related) => (
                  <ProductCard key={related.id} item={related} />
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </StoreWishlistProvider>

      <Footer />
    </div>
  );
}
