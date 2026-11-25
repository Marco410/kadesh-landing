"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "kadesh/utils/cn";
import AdCarousel from "kadesh/components/ads/AdCarousel";
import { useActiveAds } from "kadesh/components/ads/AdsProvider";
import { contextPoint, needsVisitorLocation, pickAds } from "kadesh/components/ads/pick";
import type { AdContext, AdPlacement } from "kadesh/components/ads/types";
import { getVisitorLocation, type VisitorLocation } from "kadesh/components/ads/visitorLocation";
import AdInfoButton from "./AdInfoButton";

/** Side block of 300×250 (medium rectangle) + padding; it only fits from xl up. */
export const AD_SIDE_CLASS = "w-[316px] shrink-0";
export const AD_SIDE_MEDIA = "(min-width: 1280px)";
export const AD_INLINE_MEDIA = "(max-width: 1279px)";

interface AdSlotProps {
  /** Which screen it is: decides which ads may show (Operaciones picks it per ad). */
  placement: AdPlacement;
  /** The animal or clinic on screen: its own ad is skipped and zone ads are measured from it. */
  context?: AdContext;
  /** Only mounts when it matches; avoids two slots when there is a phone and a desktop version. */
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

/** Small seeded generator: the same page view keeps the same order on every render. */
function seededRandom(seed: number) {
  let state = Math.floor(seed * 2 ** 32) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function AdUnit({ placement, context, pageKey, className }: AdSlotProps & { pageKey: string }) {
  const ads = useActiveAds();
  const [seed] = useState(() => Math.random());
  const [visitor, setVisitor] = useState<VisitorLocation>(null);
  const pagePoint = contextPoint(context ?? {});
  // Blog and store have no place of their own: zone ads use the visitor's city, asked only if one could show.
  const wantsVisitor = !pagePoint && needsVisitorLocation(ads, placement);

  useEffect(() => {
    if (!wantsVisitor) return;
    let alive = true;
    void getVisitorLocation().then((value) => {
      if (alive) setVisitor(value);
    });
    return () => {
      alive = false;
    };
  }, [wantsVisitor]);

  const targetId = context?.targetId ?? null;
  const picked = useMemo(
    () => pickAds(ads, placement, { targetId }, pagePoint ?? visitor, seededRandom(seed)),
    // `pagePoint` is rebuilt every render: its numbers are the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ads, placement, targetId, pagePoint?.lat, pagePoint?.lng, visitor, seed],
  );

  if (picked.length === 0) return null;

  return (
    <aside
      aria-label="Publicidad"
      className={cn(
        "flex min-h-[284px] min-w-0 flex-col rounded-2xl border border-[#ececec] bg-white p-2 dark:border-white/10 dark:bg-night-raised",
        className,
      )}
    >
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2 pl-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#9aa3b2]">Publicidad</span>
        <AdInfoButton />
      </div>
      <AdCarousel ads={picked} placement={placement} pageKey={pageKey} />
    </aside>
  );
}

/**
 * The "Publicidad" card. Shows the ads Operaciones set for this placement, rotating with the time
 * split by weight (Kadesh's own included); with no ad at all it renders nothing. The list comes
 * from the server once (`AdsProvider`): showing it never asks the backend.
 */
export default function AdSlot({ placement, context, media, className }: AdSlotProps) {
  const pathname = usePathname();
  const matches = useMediaQuery(media);
  if (!matches) return null;
  // The key picks again when moving between animals without reloading.
  return <AdUnit key={pathname} placement={placement} context={context} pageKey={pathname} className={className} />;
}
