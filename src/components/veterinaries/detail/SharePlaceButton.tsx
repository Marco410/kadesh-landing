"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { SITE_URL } from "kadesh/core/site";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Shares the clinic page with the system sheet, or copies its link where there is none. */
export default function SharePlaceButton({ name, slug, className = "" }: { name: string; slug: string; className?: string }) {
  const handleShare = async () => {
    const url = `${SITE_URL}${Routes.veterinaries.detail(slug)}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${name} · KADESH`, text: `Mira esta veterinaria en KADESH: ${name}`, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    if (await copyToClipboard(url)) {
      sileo.success({ title: "Enlace copiado", description: "Pégalo donde quieras para compartir esta veterinaria." });
    } else {
      sileo.error({ title: "No se pudo copiar", description: "Copia el enlace desde la barra de direcciones." });
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartir esta veterinaria"
      title="Compartir"
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#dfe3e8] text-[#3a3a3a] transition-colors hover:border-kadesh hover:text-kadesh focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:text-[#d0d0d0] dark:hover:border-kadesh-300 dark:hover:text-kadesh-300 ${className}`}
    >
      <HugeiconsIcon icon={Share08Icon} size={18} strokeWidth={1.5} aria-hidden />
    </button>
  );
}
