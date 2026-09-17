"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { getPetPlaceBookingMode } from "./appointments";
import PetPlaceBookingModal from "./PetPlaceBookingModal";
import { veterinaryBookHref, veterinaryDetailHref } from "./petPlaceSlug";
import type { PetPlaceDetail } from "./types";

interface PetPlaceBookCtaProps {
  place: PetPlaceDetail;
}

export default function PetPlaceBookCta({ place }: PetPlaceBookCtaProps) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const mode = getPetPlaceBookingMode(place.types);

  const goToLogin = useCallback(() => {
    router.push(
      `${Routes.auth.login}?redirect=${encodeURIComponent(veterinaryBookHref(place))}`,
    );
  }, [place, router]);

  const openBooking = () => {
    if (!user?.id) {
      goToLogin();
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!mode || userLoading) return;
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("reservar") !== "1") {
      return;
    }
    if (!user?.id) {
      goToLogin();
      return;
    }
    setOpen(true);
    router.replace(veterinaryDetailHref(place), { scroll: false });
  }, [mode, user, userLoading, goToLogin, place, router]);

  if (!mode) return null;

  return (
    <>
      <button
        type="button"
        onClick={openBooking}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 sm:px-5 lg:w-auto"
      >
        <HugeiconsIcon
          icon={Calendar02Icon}
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        {mode === "stay" ? "Agendar estancia" : "Reservar cita"}
      </button>
      <PetPlaceBookingModal
        place={place}
        isOpen={open}
        onClose={close}
      />
    </>
  );
}
