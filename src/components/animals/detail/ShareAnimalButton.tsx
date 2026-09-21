"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ShareIcon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { SITE_URL } from "kadesh/core/site";
import { useUiMotion } from "kadesh/components/shared/motion";

interface ShareAnimalButtonProps {
  animal: { id: string; slug?: string | null; name?: string | null };
  statusLabel: string;
  city?: string | null;
  className?: string;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

export default function ShareAnimalButton({
  animal,
  statusLabel,
  city,
  className = "",
}: ShareAnimalButtonProps) {
  const motionPrefs = useUiMotion();

  const handleShare = async () => {
    const url = `${SITE_URL}${Routes.animals.detail(animal.slug || animal.id)}`;
    const name = animal.name?.trim() || "Animal";
    const title = `${name} · ${statusLabel}${city ? ` en ${city}` : ""}`;
    const text = `Ayuda a difundir este reporte en KADESH: ${title}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    if (await copyToClipboard(url)) {
      sileo.success({
        title: "Enlace copiado",
        description: "Pégalo donde quieras para compartir este reporte.",
      });
    } else {
      sileo.error({
        title: "No se pudo copiar",
        description: "Copia el enlace desde la barra de direcciones.",
      });
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleShare}
      whileTap={motionPrefs.tap}
      aria-label="Compartir este reporte"
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#dfe3ea] px-4 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#eef1f6] dark:border-white/15 dark:text-[#eef1f6] dark:hover:bg-white/10 lg:min-h-9 ${className}`}
    >
      <HugeiconsIcon icon={ShareIcon} size={16} strokeWidth={1.5} />
      Compartir
    </motion.button>
  );
}
