"use client";

import { useState } from 'react';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, SquareArrowExpand01Icon } from '@hugeicons/core-free-icons';
import FullscreenCarousel from './FullscreenCarousel';
import { TypeGlyph } from '../TypeGlyph';
import { sortMultimediaByOrder } from '../sortMultimedia';

interface AnimalImageGridProps {
  images: Array<{ order?: number | null; image: { url: string } }>;
  animalName: string;
  typeName?: string;
  statusColor: string;
}

function EmptyPhoto({ typeName }: { typeName?: string }) {
  return (
    <div className="flex h-[min(52vh,420px)] w-full flex-col items-center justify-center gap-3 bg-[#f3f5f8] dark:bg-night">
      {typeName ? (
        <TypeGlyph type={typeName} className="h-16 w-16 text-[#9aa3b2]" />
      ) : (
        <HugeiconsIcon icon={Image01Icon} size={40} className="text-[#9aa3b2]" strokeWidth={1.5} />
      )}
      <p className="text-sm font-medium text-[#5a5a5a] dark:text-[#9aa3b2]">Sin foto</p>
    </div>
  );
}

export default function AnimalImageGrid({
  images,
  animalName,
  typeName,
  statusColor,
}: AnimalImageGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const ordered = sortMultimediaByOrder(images);
  const imageUrls = ordered.map((item) => item.image?.url).filter(Boolean) as string[];
  const visibleUrls = imageUrls.filter((_, index) => !broken[index]);

  if (visibleUrls.length === 0) {
    return <EmptyPhoto typeName={typeName} />;
  }

  const selectedImage = visibleUrls[Math.min(selectedImageIndex, visibleUrls.length - 1)];

  return (
    <div className="w-full">
      <div className="relative h-[min(52vh,420px)] w-full overflow-hidden bg-[#f3f5f8] dark:bg-night">
        <Image
          src={selectedImage}
          alt={animalName || 'Animal'}
          fill
          className="object-cover"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onError={() => {
            const originalIndex = imageUrls.indexOf(selectedImage);
            if (originalIndex >= 0) {
              setBroken((current) => ({ ...current, [originalIndex]: true }));
            }
          }}
        />
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#121212]/55 text-white backdrop-blur-sm hover:bg-[#121212]/75"
          aria-label="Ver en pantalla completa"
        >
          <HugeiconsIcon icon={SquareArrowExpand01Icon} size={18} strokeWidth={1.5} />
        </button>
      </div>

      {visibleUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {visibleUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
              style={{
                boxShadow:
                  selectedImageIndex === index
                    ? `inset 0 0 0 2px ${statusColor}`
                    : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              }}
              aria-label={`Foto ${index + 1}`}
              aria-pressed={selectedImageIndex === index}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <FullscreenCarousel
          imageUrls={visibleUrls}
          animalName={animalName}
          statusColor={statusColor}
          initialIndex={selectedImageIndex}
          onClose={(lastIndex) => {
            setIsFullscreen(false);
            if (typeof lastIndex === 'number') setSelectedImageIndex(lastIndex);
          }}
        />
      )}
    </div>
  );
}
