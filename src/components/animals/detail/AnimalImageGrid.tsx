"use client";

import { useState } from 'react';
import Image from 'next/image';
import { getStatusColor } from '../constants';
import FullscreenCarousel from './FullscreenCarousel';

interface AnimalImageGridProps {
  images: Array<{ image: { url: string } }>;
  animalName: string;
  logs?: Array<{ status: string }>;
}

export default function AnimalImageGrid({ images, animalName, logs }: AnimalImageGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const latestLog = logs && logs.length > 0 ? logs[0] : null;
  const statusColor = getStatusColor(latestLog?.status || 'register');

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#2a2a2a] dark:to-[#1e1e1e] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#e0e0e0] dark:border-[#3a3a3a]">
        <svg className="w-16 h-16 text-[#616161] dark:text-[#b0b0b0] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-[#616161] dark:text-[#b0b0b0] text-sm font-medium">No hay imágenes disponibles</p>
      </div>
    );
  }

  const imageUrls = images.map((item) => item.image?.url).filter(Boolean) as string[];

  if (imageUrls.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#2a2a2a] dark:to-[#1e1e1e] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#e0e0e0] dark:border-[#3a3a3a]">
        <svg className="w-16 h-16 text-[#616161] dark:text-[#b0b0b0] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-[#616161] dark:text-[#b0b0b0] text-sm font-medium">No hay imágenes disponibles</p>
      </div>
    );
  }

  const selectedImage = imageUrls[selectedImageIndex] || imageUrls[0];

  return (
    <div className="w-full">
      <div
        className="relative w-full h-[400px] md:h-[400px] rounded-xl overflow-hidden shadow-xl transition-all"
        style={{ 
          border: `5px solid ${statusColor}`,
          boxShadow: `0 10px 30px -5px ${statusColor}40, 0 0 0 1px ${statusColor}20`
        }}
      >
        <Image
          src={selectedImage}
          alt={`${animalName} - Imagen ${selectedImageIndex + 1}`}
          fill
          className="object-cover"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Botón pantalla completa */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
          title="Ver en pantalla completa"
          aria-label="Ver en pantalla completa"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {imageUrls.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex gap-3 px-4 py-3 bg-black/70 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl">
              {imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
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
                      : '0 2px 4px rgba(0, 0, 0, 0.2)'
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
                        boxShadow: `inset 0 0 20px ${statusColor}30`
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

      {/* Modal pantalla completa con el mismo carrusel */}
      {isFullscreen && (
        <FullscreenCarousel
          imageUrls={imageUrls}
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
