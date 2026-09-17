"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { ConfirmModal } from "kadesh/components/shared";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { usePetPlaceLikes } from "./hooks/usePetPlaceLikes";

interface PetPlaceLikeButtonProps {
  petPlaceId: string;
  initialCount?: number;
}

/**
 * Like de la ficha: junto a «Cómo llegar». Sin sesión pide cuenta; con sesión crea o borra PetPlaceLike.
 */
export default function PetPlaceLikeButton({
  petPlaceId,
  initialCount = 0,
}: PetPlaceLikeButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { likesCount, isLiked, isBusy, handleLike } = usePetPlaceLikes(
    petPlaceId,
    initialCount,
  );

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
      <button
        type="button"
        onClick={onClick}
        disabled={isBusy}
        aria-pressed={isLiked}
        aria-label={
          isLiked ? "Quitar me gusta de esta veterinaria" : "Me gusta esta veterinaria"
        }
        className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-sm font-semibold tabular-nums transition-colors disabled:cursor-wait disabled:opacity-60 ${
          isLiked
            ? "border-kadesh bg-kadesh text-white hover:bg-kadesh-600"
            : "border-kadesh text-kadesh hover:bg-kadesh hover:text-white"
        }`}
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          className={isLiked ? "fill-current" : undefined}
        />
        <span>{likesCount}</span>
      </button>
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
