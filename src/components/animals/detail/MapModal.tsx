"use client";

import { useEffect } from 'react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-7xl mx-4 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white dark:bg-[#1e1e1e] text-[#212121] dark:text-white rounded-full p-2 shadow-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
          aria-label="Cerrar mapa"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <LogMap lat={lat} lng={lng} status={status} height="100%" />
      </div>
    </div>
  );
}



