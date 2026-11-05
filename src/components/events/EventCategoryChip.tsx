import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'kadesh/utils/cn';
import { eventCategory } from './constants';

/** Etiqueta del tipo de evento con su color e ícono. */
export default function EventCategoryChip({
  category,
  className,
  size = 'md',
}: {
  category: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const config = eventCategory(category);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold text-white shadow-sm',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        className,
      )}
      style={{ backgroundColor: config.color }}
    >
      <HugeiconsIcon icon={config.icon} size={size === 'sm' ? 13 : 15} strokeWidth={2} aria-hidden="true" />
      {config.label}
    </span>
  );
}
