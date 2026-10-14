"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "kadesh/utils/cn";
import { ADSENSE_CLIENT } from "kadesh/core/ads";
import AdInfoButton from "./AdInfoButton";
import HouseAd from "./HouseAd";

/** Bloque lateral de 300×250 (rectángulo mediano) + padding; solo cabe a partir de xl. */
export const AD_SIDE_CLASS = "w-[316px] shrink-0";
export const AD_SIDE_MEDIA = "(min-width: 1280px)";
export const AD_INLINE_MEDIA = "(max-width: 1279px)";

/** Si AdSense no llena el hueco en este tiempo, se muestra un anuncio propio. */
const ADSENSE_TIMEOUT_MS = 5000;

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

function AdSkeleton() {
  const bar = "rounded-md bg-[#e6e9ef] dark:bg-white/10";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex flex-col rounded-xl bg-[#f7f8fa] p-4 motion-safe:animate-pulse dark:bg-night"
    >
      <div className={`h-3 w-28 ${bar}`} />
      <div className={`mt-4 h-5 w-11/12 ${bar}`} />
      <div className={`mt-2 h-5 w-2/3 ${bar}`} />
      <div className={`mt-4 h-3 w-full ${bar}`} />
      <div className={`mt-2 h-3 w-full ${bar}`} />
      <div className={`mb-3 mt-2 h-3 w-1/2 ${bar}`} />
      <div className={`mt-auto h-8 w-28 ${bar}`} />
    </div>
  );
}

function AdUnit({
  client,
  slot,
  placement,
  className,
}: {
  client: string;
  slot: string;
  placement: string;
  className?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const [fallback, setFallback] = useState(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return;
    if (!ins.getAttribute("data-adsbygoogle-status")) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("[ads] no se pudo pedir el anuncio", error);
        setFallback(true);
        return;
      }
    }
    // Sin anuncio de Google (sitio sin aprobar, sin inventario o bloqueador): anuncio propio.
    const observer = new MutationObserver(() => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "filled") setFilled(true);
      if (status === "unfilled") setFallback(true);
    });
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    const timeout = window.setTimeout(() => {
      if (ins.getAttribute("data-ad-status") !== "filled") setFallback(true);
    }, ADSENSE_TIMEOUT_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <aside
      aria-label="Publicidad"
      className={cn(
        "flex min-h-[284px] min-w-0 flex-col rounded-2xl border border-[#ececec] bg-white p-2 dark:border-white/10 dark:bg-night-raised",
        className,
      )}
    >
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2 pl-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#9aa3b2]">
          Publicidad
        </span>
        <AdInfoButton />
      </div>
      {fallback ? (
        <HouseAd placement={placement} />
      ) : (
        <div className="relative flex min-h-0 flex-1">
          <ins
            ref={insRef}
            className="adsbygoogle block min-h-0 w-full flex-1"
            style={{ display: "block" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="rectangle"
            data-full-width-responsive="false"
          />
          {/* Encima del <ins> (que debe conservar su tamaño para que AdSense lo mida) mientras llega el anuncio. */}
          {!filled && <AdSkeleton />}
        </div>
      )}
    </aside>
  );
}

/**
 * Bloque de AdSense discreto. No renderiza nada si falta el slot;
 * si Google no tiene anuncio que mostrar, enseña uno de Kadesh Business o Kadesh Food.
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
      placement={pathname.split("/")[1] || "inicio"}
      className={className}
    />
  );
}
