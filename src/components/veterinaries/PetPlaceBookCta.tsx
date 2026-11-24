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
import { motion } from "framer-motion";
import { useUiMotion } from "kadesh/components/shared/motion";

interface PetPlaceBookCtaProps {
  place: PetPlaceDetail;
  /** Replaces the button's look (size and width); the brand fill stays. */
  className?: string;
  /**
   * Opens the booking from `?reservar=1`. Only one instance per page may do it (the header's), or
   * the mobile action bar would open a second modal.
   */
  handleDeepLink?: boolean;
}

const DEFAULT_CLASS = "min-h-11 w-full px-3 sm:px-5 lg:w-auto";

export default function PetPlaceBookCta({
  place,
  className = DEFAULT_CLASS,
  handleDeepLink = true,
}: PetPlaceBookCtaProps) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const mode = getPetPlaceBookingMode(place.types);
  const motionPrefs = useUiMotion();

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
    if (!handleDeepLink || !mode || userLoading) return;
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
  }, [handleDeepLink, mode, user, userLoading, goToLogin, place, router]);

  if (!mode) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={openBooking}
        whileTap={motionPrefs.tap}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-kadesh text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${className}`}
      >
        <HugeiconsIcon
          icon={Calendar02Icon}
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        {mode === "stay" ? "Agendar estancia" : "Reservar cita"}
      </motion.button>
      <PetPlaceBookingModal
        place={place}
        isOpen={open}
        onClose={close}
      />
    </>
  );
}
