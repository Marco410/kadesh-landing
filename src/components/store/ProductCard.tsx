import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { Bone } from 'kadesh/components/ui/skeleton';
import CardCartButton from './cart/CardCartButton';
import { discountPercent, formatPrice } from './format';
import StoreStars from './StoreStars';
import { StoreWishlistButton } from './StoreWishlist';
import type { StoreItem } from './types';

/**
 * Card of a product (`/tienda`, related products, wishlist). No hooks of its own: it renders on
 * the server and in the browser. The heart only shows inside a `StoreWishlistProvider`; the cart
 * button (`CardCartButton`) is a client island.
 */
export default function ProductCard({ item, className }: { item: StoreItem; className?: string }) {
  const discount = discountPercent(item.priceCents, item.compareAtPriceCents);
  const affiliate = item.seller === 'mercado_libre';

  return (
    <article
      className={cn(
        // Featured products are told apart by the «Destacado» tag only: same border as the rest.
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]',
        // The name's link covers the card: when it has keyboard focus, the whole card shows it.
        'has-[h3_a:focus-visible]:outline has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-kadesh',
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#f3f5f8] dark:bg-[#2a3548]">
        {item.coverUrl ? (
          // Product photos can live on any host (uploaded or linked): a plain <img>, not next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverUrl}
            alt={item.coverAlt ?? ''}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#9aa3b2]">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={48} strokeWidth={1.3} aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {item.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-[#3a2600] shadow-sm">
              <HugeiconsIcon icon={StarIcon} size={13} strokeWidth={2.4} aria-hidden="true" />
              Destacado
            </span>
          ) : null}
          {discount ? (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">-{discount} %</span>
          ) : null}
          {!item.inStock ? (
            <span className="rounded-full bg-[#121212]/85 px-2.5 py-1 text-xs font-bold text-white">Agotado</span>
          ) : null}
        </div>
        <StoreWishlistButton productId={item.id} productName={item.name} className="absolute top-3 right-3 z-20" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {item.brand ? (
          <p className="text-xs font-semibold tracking-wide text-[#5a5a5a] uppercase dark:text-[#9aa3b2]">{item.brand.name}</p>
        ) : null}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#212121] dark:text-white">
          <Link href={Routes.store.product(item.slug)} className="after:absolute after:inset-0 after:z-10 focus-visible:outline-none">
            {item.name}
          </Link>
        </h3>
        <StoreStars average={item.ratingAverage} count={item.ratingCount} size={14} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-lg font-black text-[#121212] dark:text-white">{formatPrice(item.priceCents)}</span>
          {discount ? (
            <span className="text-sm text-[#5a5a5a] line-through dark:text-[#9aa3b2]">
              <span className="sr-only">Antes </span>
              {formatPrice(item.compareAtPriceCents)}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          {affiliate ? 'En Mercado Libre · precio aproximado' : 'Vendido por Kadesh'}
        </p>
        <div className="pt-2 empty:hidden">
          <CardCartButton item={item} />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
      <Bone kind="box" className="aspect-square w-full" radius="0" />
      <div className="flex flex-col gap-2 p-4">
        <Bone kind="line" width="40%" />
        <Bone kind="title" width="85%" />
        <Bone kind="line" width="55%" />
        <Bone kind="title" width="35%" />
      </div>
    </div>
  );
}
