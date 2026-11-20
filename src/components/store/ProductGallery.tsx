'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';
import type { StoreImage } from './types';

/** Photos of a product: a large one and, with more than one, thumbnails to switch. */
export default function ProductGallery({ images, productName }: { images: StoreImage[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const current = images[Math.min(index, images.length - 1)] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#ececec] bg-[#f3f5f8] dark:border-[#2a2a2a] dark:bg-[#2a3548]">
        {current ? (
          // Product photos can live on any host (uploaded or linked): a plain <img>, not next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt || productName} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#9aa3b2]">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={72} strokeWidth={1.2} aria-hidden="true" />
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Fotos del producto">
          {images.map((image, position) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Ver foto ${position + 1} de ${images.length}`}
                aria-current={position === index ? 'true' : undefined}
                className={cn(
                  'block size-16 overflow-hidden rounded-xl border-2 bg-[#f3f5f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:bg-[#2a3548] sm:size-20',
                  position === index ? 'border-kadesh' : 'border-transparent hover:border-[#d8dee8] dark:hover:border-white/25',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
