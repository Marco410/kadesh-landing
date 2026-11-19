import { cn } from 'kadesh/utils/cn';
import { formatPrice } from '../format';
import type { CartQuote } from '../types';

/** Subtotal, shipping and total of a quote. Shared by the cart and the checkout. */
export default function CartSummary({
  quote,
  className,
  children,
}: {
  quote: CartQuote;
  className?: string;
  /** The action under the total (continue, pay). */
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]', className)}>
      <h2 className="mb-4 text-lg font-bold text-[#121212] dark:text-white">Resumen</h2>
      <dl className="flex flex-col gap-2 text-[15px] text-[#3a3a3a] dark:text-[#d0d0d0]">
        <div className="flex justify-between gap-4">
          <dt>
            Subtotal ({quote.itemsCount} {quote.itemsCount === 1 ? 'pieza' : 'piezas'})
          </dt>
          <dd className="tabular-nums">{formatPrice(quote.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Envío</dt>
          <dd className="tabular-nums">{quote.shippingCents > 0 ? formatPrice(quote.shippingCents) : 'Gratis'}</dd>
        </div>
        <div className="mt-2 flex justify-between gap-4 border-t border-[#ececec] pt-3 text-lg font-black text-[#121212] dark:border-[#2a2a2a] dark:text-white">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(quote.totalCents)}</dd>
        </div>
      </dl>
      {quote.missingForFreeShippingCents > 0 ? (
        <p className="mt-3 rounded-xl bg-kadesh-50 px-3 py-2 text-sm text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300">
          Te faltan {formatPrice(quote.missingForFreeShippingCents)} para que el envío sea gratis.
        </p>
      ) : null}
      {children ? <div className="mt-5 flex flex-col gap-3">{children}</div> : null}
    </div>
  );
}
