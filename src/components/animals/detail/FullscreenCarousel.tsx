"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

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
    return () => { document.body.style.overflow = prev; };
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={() => onClose(selectedImageIndex)}>
      {/* Close + contador */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-white/90 text-sm font-medium">
          {selectedImageIndex + 1} / {imageUrls.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(selectedImageIndex); }}
          className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Imagen grande centrada */}
      <div
        className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-5xl">
          <Image
            src={selectedImage}
            alt={`${animalName} - Imagen ${selectedImageIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Siguiente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Carrusel de miniaturas (mismo estilo que el grid) */}
      {imageUrls.length > 1 && (
        <div
          className="flex justify-center pb-6 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 px-4 py-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl">
            {imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedImageIndex === index
                    ? 'scale-110'
                    : 'hover:scale-105 opacity-75 hover:opacity-100'
                }`}
                style={{
                  border: selectedImageIndex === index
                    ? `3px solid ${statusColor}`
                    : '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: selectedImageIndex === index
                    ? `0 4px 12px ${statusColor}80, 0 0 0 2px ${statusColor}40`
                    : '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                <Image
                  src={url}
                  alt={`${animalName} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {selectedImageIndex === index && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `linear-gradient(to bottom, ${statusColor}40, ${statusColor}20)`,
                      boxShadow: `inset 0 0 20px ${statusColor}30`,
                    }}
                  />
                )}
                {selectedImageIndex !== index && (
                  <div className="absolute inset-0 bg-black/20 rounded-xl" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
