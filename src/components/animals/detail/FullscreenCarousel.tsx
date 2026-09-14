"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export interface FullscreenCarouselProps {
  imageUrls: string[];
  animalName: string;
  statusColor: string;
  initialIndex: number;
  onClose: (lastIndex?: number) => void;
}

export default function FullscreenCarousel({
  imageUrls,
  animalName,
  statusColor,
  initialIndex,
  onClose,
}: FullscreenCarouselProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goPrev = useCallback(() => {
    setSelectedImageIndex((i) => (i <= 0 ? imageUrls.length - 1 : i - 1));
  }, [imageUrls.length]);

  const goNext = useCallback(() => {
    setSelectedImageIndex((i) => (i >= imageUrls.length - 1 ? 0 : i + 1));
  }, [imageUrls.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(selectedImageIndex);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, goPrev, goNext, selectedImageIndex]);

  const selectedImage = imageUrls[selectedImageIndex] || imageUrls[0];

  return (
    <div
      className="fixed inset-0 z-[2000] flex flex-col bg-black/95"
      onClick={() => onClose(selectedImageIndex)}
    >
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-white/90">
          {selectedImageIndex + 1} / {imageUrls.length}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(selectedImageIndex);
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15"
          aria-label="Cerrar"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full w-full max-w-5xl">
          <Image
            src={selectedImage}
            alt={`${animalName} — foto ${selectedImageIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
          {imageUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Anterior"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={22} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Siguiente"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={22} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {imageUrls.length > 1 && (
        <div className="flex justify-center pb-6 pt-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 px-3 py-2">
            {imageUrls.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"
                style={{
                  boxShadow:
                    selectedImageIndex === index
                      ? `inset 0 0 0 2px ${statusColor}`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                }}
                aria-label={`Foto ${index + 1}`}
                aria-pressed={selectedImageIndex === index}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
