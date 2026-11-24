import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { formatPrice } from './format';
import type { StoreShowcaseItem } from './types';

/**
 * Small, quiet box with a few store products for pages outside the store. No hooks and no request
 * of its own: the server fetches the items (`fetchStoreShowcase`) and passes them down, so it
 * renders in server and client components alike. Renders nothing without items (store closed or
 * API down).
 *
 * - `card` (veterinary page): bordered card like the page's other sections, products in a row
 *   from `sm` up.
 * - `sidebar` (blog's right column): no border, same heading and list as «Lo más leído».
 */
export default function StoreShowcase({
  items,
  variant = 'card',
  title = 'De la tienda Kadesh',
  className,
}: {
  items: StoreShowcaseItem[];
  variant?: 'card' | 'sidebar';
  title?: string;
  className?: string;
}) {
  if (!items.length) return null;
  const sidebar = variant === 'sidebar';

  return (
    <section
      aria-labelledby="tienda-escaparate-titulo"
      className={cn(
        // A container: in a narrow column (the clinic page's side) the three products stack.
        !sidebar && '@container rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised',
        className,
      )}
    >
      <div className={cn('flex items-baseline justify-between gap-3', sidebar ? 'mb-1' : 'mb-2.5')}>
        <h2
          id="tienda-escaparate-titulo"
          className={
            sidebar
              ? 'text-lg font-bold tracking-[-0.01em] text-[#212121] dark:text-white'
              : 'text-sm font-bold text-[#121212] dark:text-white'
          }
        >
          {title}
        </h2>
        <Link
          href={Routes.store.index}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-kadesh hover:underline"
        >
          Ver tienda
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      <ul
        className={
          sidebar
            ? 'divide-y divide-[#e0e0e0] dark:divide-[#3a3a3a]'
            : 'grid grid-cols-1 gap-2 @xl:grid-cols-3 @xl:gap-3'
        }
      >
        {items.map((item) => {
          const onSale = item.compareAtPriceCents != null && item.compareAtPriceCents > item.priceCents;
          return (
            <li key={item.id} className="min-w-0">
              <Link
                href={Routes.store.product(item.slug)}
                className={cn(
                  'group flex items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh',
                  sidebar
                    ? '-mx-2 gap-3 px-2 py-2.5 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1e1e1e]'
                    : 'gap-2.5 focus-visible:outline-offset-2',
                )}
              >
                <span className="relative block size-14 shrink-0 overflow-hidden rounded-lg bg-[#f3f5f8] dark:bg-[#2a3548]">
                  {item.coverUrl ? (
                    // Product photos can live on any host: a plain <img>, not next/image.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverUrl}
                      alt={item.coverAlt ?? ''}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[#9aa3b2]">
                      <HugeiconsIcon icon={ShoppingBag01Icon} size={22} aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className={cn(
                      'line-clamp-2 leading-snug group-hover:underline',
                      sidebar
                        ? 'text-sm font-semibold text-[#212121] dark:text-white'
                        : 'text-xs font-medium text-[#3a3a3a] dark:text-[#d0d0d0]',
                    )}
                  >
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-[#121212] dark:text-white">
                    {formatPrice(item.priceCents)}
                    {onSale ? <span className="sr-only"> (en oferta)</span> : null}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
