'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { FullScreenIcon } from '@hugeicons/core-free-icons';
// Directo y no por el barrel de `animals/detail`: el barrel metería mapas y hooks de la ficha de animal.
import FullscreenCarousel from 'kadesh/components/animals/detail/FullscreenCarousel';
import { cn } from 'kadesh/utils/cn';
import { eventCategory } from './constants';
import type { EventPhoto } from './types';

/**
 * Portada grande y miniaturas. Tocar la portada la abre en pantalla completa: el recuadro es 16:9 y
 * recorta los carteles verticales. Sin fotos, un fondo con el ícono del tipo de evento.
 */
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
  const [fullscreen, setFullscreen] = useState(false);
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
      <button
        type="button"
        onClick={() => setFullscreen(true)}
        aria-label={images.length > 1 ? `Ver foto ${selected + 1} de ${images.length} en pantalla completa` : 'Ver foto en pantalla completa'}
        className="group relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-3xl bg-[#e8edf3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:bg-[#2a3548]"
      >
        <Image
          src={current.image?.url as string}
          alt={selected === 0 ? title : `${title} (foto ${selected + 1})`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-black/65 px-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-black/80"
        >
          <HugeiconsIcon icon={FullScreenIcon} size={16} strokeWidth={2} />
          Ver completa
        </span>
      </button>
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
      {fullscreen ? (
        <FullscreenCarousel
          imageUrls={images.map((photo) => photo.image?.url as string)}
          animalName={title}
          statusColor={config.color}
          initialIndex={selected}
          onClose={(lastIndex) => {
            setFullscreen(false);
            if (typeof lastIndex === 'number') setSelected(lastIndex);
          }}
        />
      ) : null}
    </div>
  );
}
