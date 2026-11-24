import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { AD_PLACEMENT } from 'kadesh/components/ads/types';
import { Routes } from 'kadesh/core/routes';
import AdSlot from 'kadesh/components/shared/AdSlot';
import { cn } from 'kadesh/utils/cn';
import { formatPrice } from './format';
import StoreStars from './StoreStars';
import type { StoreItem } from './types';

/**
 * Right column of `/tienda`: «Los más vendidos» (or «Lo más nuevo» before the first sales) and
 * the ad block. Painted by the server with the page; no request of its own. On screens narrower
 * than `xl` it goes under the products.
 */
export default function StoreAside({
  kind,
  items,
  className,
}: {
  kind: 'best_selling' | 'newest';
  items: StoreItem[];
  className?: string;
}) {
  const title = kind === 'best_selling' ? 'Los más vendidos' : 'Lo más nuevo';

  return (
    <aside aria-label="Más de la tienda" className={cn('flex min-w-0 flex-col gap-8', className)}>
      {items.length > 0 ? (
        <section aria-labelledby="tienda-top-titulo">
          <h2 id="tienda-top-titulo" className="text-lg font-bold tracking-[-0.01em] text-[#212121] dark:text-white">
            {title}
          </h2>
          <ol className="mt-3 divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
            {items.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={Routes.store.product(item.slug)}
                  className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[#f5f6f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:hover:bg-[#1e1e1e]"
                >
                  {kind === 'best_selling' ? (
                    <span aria-hidden="true" className="w-5 shrink-0 text-right text-base font-black tabular-nums text-kadesh">
                      {index + 1}
                    </span>
                  ) : null}
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#f3f5f8] dark:bg-[#2a3548]">
                    {item.coverUrl ? (
                      // Product photos can live on any host: a plain <img>, not next/image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[#9aa3b2]">
                        <HugeiconsIcon icon={ShoppingBag01Icon} size={22} aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-[#212121] group-hover:underline dark:text-white">
                      {item.name}
                    </span>
                    {item.ratingCount > 0 ? <StoreStars average={item.ratingAverage} count={item.ratingCount} size={12} /> : null}
                    <span className="text-sm font-black text-[#121212] dark:text-white">{formatPrice(item.priceCents)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <AdSlot placement={AD_PLACEMENT.STORE} />
    </aside>
  );
}
