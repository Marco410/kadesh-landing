"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { getPetPlaceBookingMode } from "./appointments";
import PetPlaceBookingForm from "./PetPlaceBookingForm";
import type { PetPlaceDetail } from "./types";

interface PetPlaceBookingModalProps {
  place: PetPlaceDetail;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetPlaceBookingModal({
  place,
  isOpen,
  onClose,
}: PetPlaceBookingModalProps) {
  const mode = getPetPlaceBookingMode(place.types);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mode) return null;

  const title = mode === "stay" ? "Agendar estancia" : "Reservar cita";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="flex max-h-[100dvh] w-full flex-col rounded-t-2xl border border-[#ececec] bg-white shadow-2xl dark:border-white/10 dark:bg-night-raised sm:max-h-[90dvh] sm:max-w-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#ececec] px-4 py-3 dark:border-white/10 sm:px-5">
          <div className="min-w-0">
            <h2
              id="booking-modal-title"
              className="text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-white"
            >
              {title}
            </h2>
            {place.name ? (
              <p className="mt-0.5 break-words text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                {place.name}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-[#f5f5f5] dark:text-[#b0b0b0] dark:hover:bg-white/10"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <PetPlaceBookingForm place={place} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
