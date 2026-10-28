"use client";

import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import type { PetImage } from './types';

/** Fotos ya guardadas en un formulario de edición: se pueden quitar (se borran al guardar). */
export default function ExistingPhotos({
  photos,
  removedIds,
  onToggle,
}: {
  photos: PetImage[];
  removedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (photos.length === 0) return null;
  return (
    <ul className="mb-3 flex flex-wrap gap-2">
      {photos.map((photo) => {
        const removed = removedIds.includes(photo.id);
        return (
          <li key={photo.id} className="relative">
            <div
              className={`relative h-20 w-20 overflow-hidden rounded-xl bg-[#e8edf3] dark:bg-[#2a3548] ${
                removed ? 'opacity-35' : ''
              }`}
            >
              {photo.image?.url ? (
                <Image src={photo.image.url} alt="" fill className="object-cover" sizes="80px" />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onToggle(photo.id)}
              aria-label={removed ? 'Conservar esta foto' : 'Quitar esta foto'}
              aria-pressed={removed}
              className="absolute -right-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dee8] bg-white text-[#3a3a3a] shadow-sm hover:bg-[#f7f8fa] dark:border-white/18 dark:bg-night dark:text-[#e8edf4]"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </button>
            {removed ? (
              <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-bold text-[#121212] dark:text-white">
                Se quitará
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
