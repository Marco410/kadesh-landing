"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { ConfirmModal } from "kadesh/components/shared";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { usePetPlaceLikes } from "./hooks/usePetPlaceLikes";
import { motion } from "framer-motion";
import { useUiMotion } from "kadesh/components/shared/motion";

interface PetPlaceLikeButtonProps {
  petPlaceId: string;
  initialCount?: number;
  /** `quiet`: neutral outline, for the row of small actions in the page header. */
  variant?: "brand" | "quiet";
}

/**
 * Like de la ficha: junto a «Cómo llegar». Sin sesión pide cuenta; con sesión crea o borra PetPlaceLike.
 */
export default function PetPlaceLikeButton({
  petPlaceId,
  initialCount = 0,
  variant = "brand",
}: PetPlaceLikeButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { likesCount, isLiked, isBusy, handleLike } = usePetPlaceLikes(
    petPlaceId,
    initialCount,
  );
  const motionPrefs = useUiMotion();

  const onClick = () => {
    if (!user?.id) {
      setShowAuthModal(true);
      return;
    }
    handleLike();
  };

  const goToAuth = () => {
    setShowAuthModal(false);
    const path =
      typeof window !== "undefined" ? window.location.pathname : "";
    router.push(
      `${Routes.auth.login}?redirect=${encodeURIComponent(path)}`,
    );
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={isBusy}
        aria-pressed={isLiked}
        aria-label={
          isLiked ? "Quitar me gusta de esta veterinaria" : "Me gusta esta veterinaria"
        }
        whileTap={isBusy ? undefined : motionPrefs.tapDay}
        className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh disabled:cursor-wait disabled:opacity-60 ${
          variant === "quiet"
            ? isLiked
              ? "border border-kadesh/40 bg-kadesh-50 text-kadesh dark:bg-kadesh/15 dark:text-kadesh-300"
              : "border border-[#dfe3e8] text-[#3a3a3a] hover:border-kadesh hover:text-kadesh dark:border-white/15 dark:text-[#d0d0d0] dark:hover:border-kadesh-300 dark:hover:text-kadesh-300"
            : isLiked
              ? "border-2 border-kadesh bg-kadesh text-white hover:bg-kadesh-600"
              : "border-2 border-kadesh text-kadesh hover:bg-kadesh hover:text-white"
        }`}
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          className={isLiked ? "fill-current" : undefined}
        />
        {likesCount > 0 ? <span>{likesCount}</span> : null}
      </motion.button>
      <ConfirmModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={goToAuth}
        title="Inicia sesión para guardar"
        message="Para guardar esta veterinaria con un me gusta necesitas una cuenta."
        confirmText="Iniciar sesión"
        cancelText="Ahora no"
        confirmButtonColor="orange"
      />
    </>
  );
}
