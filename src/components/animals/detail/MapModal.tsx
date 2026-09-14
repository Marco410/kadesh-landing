"use client";

import { useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import LogMap from './LogMap';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  status: string;
}

export default function MapModal({ isOpen, onClose, lat, lng, status }: MapModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      onClick={onClose}
    >
      <div className="relative mx-4 my-4 h-[80vh] w-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#121212] shadow-[0_8px_18px_rgba(15,35,80,0.18)] hover:bg-[#f7f8fa] dark:bg-night-raised dark:text-[#eef1f6]"
          aria-label="Cerrar mapa"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
        </button>
        <div className="h-full overflow-hidden rounded-2xl">
          <LogMap lat={lat} lng={lng} status={status} />
        </div>
      </div>
    </div>
  );
}
