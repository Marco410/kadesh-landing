'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useCartCount } from './cartStore';

/** Header link to the cart with how many units it carries. Reads the browser's cart: no request. */
export default function CartLink({ className }: { className?: string }) {
  const count = useCartCount();
  return (
    <Link
      href={Routes.store.cart}
      aria-label={count > 0 ? `Carrito, ${count} ${count === 1 ? 'pieza' : 'piezas'}` : 'Carrito'}
      className={cn('relative inline-flex size-11 items-center justify-center rounded-lg', className)}
    >
      <HugeiconsIcon icon={ShoppingBag01Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute top-1 right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-kadesh px-1 text-[11px] font-bold leading-5 text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
