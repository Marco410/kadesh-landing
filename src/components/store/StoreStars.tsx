import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';
import { formatRating, reviewsCountText } from './format';

/** Five stars filled up to `rating` (rounded to the nearest whole star). Decorative: pair it with text. */
export function StarRow({ rating, size = 16, className }: { rating: number; size?: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          size={size}
          strokeWidth={1.5}
          fill={star <= filled ? 'currentColor' : 'none'}
          className={star <= filled ? 'text-amber-500' : 'text-[#c4cad4] dark:text-white/25'}
        />
      ))}
    </span>
  );
}

/**
 * Stars of a product with its count. Every product starts with none: only reviews written on
 * Kadesh count.
 */
export default function StoreStars({
  average,
  count,
  size = 16,
  className,
}: {
  average: number;
  count: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]', className)}>
      <StarRow rating={count > 0 ? average : 0} size={size} />
      <span>
        {count > 0 ? (
          <>
            <span className="font-semibold text-[#121212] dark:text-white">{formatRating(average)}</span>{' '}
            <span>({count.toLocaleString('es-MX')})</span>
            <span className="sr-only"> de 5 estrellas, {reviewsCountText(count)}</span>
          </>
        ) : (
          reviewsCountText(0)
        )}
      </span>
    </span>
  );
}
