'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'kadesh/utils/cn';
import { eventCategory } from './constants';
import type { EventPhoto } from './types';

/** Portada grande y miniaturas. Sin fotos, un fondo con el ícono del tipo de evento. */
export default function EventGallery({
  photos,
  title,
  category,
}: {
  photos: EventPhoto[];
  title: string;
  category: string;
}) {
  const images = photos.filter((photo) => photo.image?.url);
  const [selected, setSelected] = useState(0);
  const config = eventCategory(category);
  const current = images[selected] ?? images[0];

  if (!current) {
    return (
      <div
        className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl text-white/90"
        style={{ backgroundImage: `linear-gradient(135deg, ${config.color} 0%, #0b2f7a 100%)` }}
      >
        <HugeiconsIcon icon={config.icon} size={88} strokeWidth={1.2} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-[#e8edf3] dark:bg-[#2a3548]">
        <Image
          src={current.image?.url as string}
          alt={selected === 0 ? title : `${title} (foto ${selected + 1})`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Fotos del evento">
          {images.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-pressed={index === selected}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
                index === selected ? 'border-kadesh' : 'border-transparent opacity-80 hover:opacity-100',
              )}
            >
              <Image src={photo.image?.url as string} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
