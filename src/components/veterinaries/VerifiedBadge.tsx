import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface VerifiedBadgeProps {
  size?: number;
}

/** Check next to the clinic name when an admin has verified the ficha. */
export default function VerifiedBadge({ size = 18 }: VerifiedBadgeProps) {
  return (
    <span
      className="inline-flex shrink-0 text-kadesh"
      title="Verificada"
      aria-label="Verificada"
    >
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        size={size}
        strokeWidth={1.8}
      />
    </span>
  );
}
