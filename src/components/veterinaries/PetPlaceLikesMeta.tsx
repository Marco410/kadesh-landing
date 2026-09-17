import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import type { PetPlace } from "./types";

export function petPlaceLikesCount(
  place: Pick<PetPlace, "pet_place_likes" | "pet_place_likesCount">,
): number {
  if (place.pet_place_likesCount != null) return place.pet_place_likesCount;
  return place.pet_place_likes?.length ?? 0;
}

interface PetPlaceLikesMetaProps {
  count: number;
  iconSize?: number;
}

/** Conteo de me gusta en fichas de lista. No se pinta si va en cero. */
export default function PetPlaceLikesMeta({
  count,
  iconSize = 14,
}: PetPlaceLikesMetaProps) {
  if (count <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 tabular-nums text-[#121212] dark:text-white"
      aria-label={`${count} me gusta`}
    >
      <HugeiconsIcon
        icon={FavouriteIcon}
        size={iconSize}
        strokeWidth={1.5}
        aria-hidden="true"
        className="flex-shrink-0 fill-kadesh text-kadesh"
      />
      <span className="font-semibold">{count}</span>
    </span>
  );
}
