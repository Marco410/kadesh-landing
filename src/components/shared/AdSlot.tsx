"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "kadesh/utils/cn";
import { ADSENSE_CLIENT } from "kadesh/core/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  /** ID del bloque de anuncios en AdSense (data-ad-slot). */
  slot: string | undefined;
  /** Solo se monta si coincide; evita pedir dos anuncios cuando hay una versión móvil y otra de escritorio. */
  media?: string;
  className?: string;
}

function useMediaQuery(query: string | undefined) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (!query) {
      setMatches(true);
      return;
    }
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function AdUnit({
  client,
  slot,
  className,
}: {
  client: string;
  slot: string;
  className?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return;
    if (!ins.getAttribute("data-adsbygoogle-status")) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("[ads] no se pudo pedir el anuncio", error);
      }
    }
    // AdSense marca data-ad-status="unfilled" cuando no tiene anuncio: entonces se oculta el hueco.
    const observer = new MutationObserver(() => {
      setUnfilled(ins.getAttribute("data-ad-status") === "unfilled");
    });
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => observer.disconnect();
  }, []);

  if (unfilled) return null;

  return (
    <aside
      aria-label="Publicidad"
      className={cn(
        "flex min-h-[250px] min-w-0 flex-col rounded-2xl border border-[#ececec] bg-white p-2 dark:border-white/10 dark:bg-night-raised",
        className,
      )}
    >
      <span className="mb-1 shrink-0 px-1 text-[10px] font-medium uppercase tracking-wider text-[#9aa3b2]">
        Publicidad
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle block min-h-0 w-full flex-1"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="rectangle"
        data-full-width-responsive="false"
      />
    </aside>
  );
}

/**
 * Bloque de AdSense discreto. No renderiza nada si falta el slot,
 * y desaparece si Google no tiene anuncio que mostrar.
 */
export default function AdSlot({ slot, media, className }: AdSlotProps) {
  const pathname = usePathname();
  const matches = useMediaQuery(media);

  if (!slot || !matches) return null;

  // La key pide un anuncio nuevo al navegar entre animales sin recargar.
  // El script de AdSense ya lo carga el layout raíz.
  return (
    <AdUnit
      key={pathname}
      client={ADSENSE_CLIENT}
      slot={slot}
      className={className}
    />
  );
}
