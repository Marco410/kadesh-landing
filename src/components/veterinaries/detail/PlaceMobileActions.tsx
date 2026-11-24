"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, Location01Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import PetPlaceBookCta from "../PetPlaceBookCta";
import type { PetPlaceDetail } from "../types";
import type { PlaceLinks } from "./placeLinks";

const ACTION =
  "inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh";
const SECONDARY = `${ACTION} border border-[#dfe3e8] bg-white text-[#121212] dark:border-white/15 dark:bg-night-raised dark:text-white`;
const PRIMARY = `${ACTION} bg-kadesh text-white`;

/**
 * Phones only: the clinic's main actions stay at the bottom while the page scrolls. Up to three:
 * booking (if it takes appointments), call (or WhatsApp) and directions. It marks `<html>` so the
 * floating help button moves above it.
 */
export default function PlaceMobileActions({
  place,
  links,
  isBookable,
}: {
  place: PetPlaceDetail;
  links: PlaceLinks;
  isBookable: boolean;
}) {
  const contactHref = links.phoneHref ?? links.whatsappHref;
  const contactIsWhatsApp = !links.phoneHref && Boolean(links.whatsappHref);
  const hasActions = isBookable || Boolean(contactHref) || Boolean(links.directionsHref);

  useEffect(() => {
    if (!hasActions) return;
    const root = document.documentElement;
    root.setAttribute("data-bottom-bar", "");
    return () => root.removeAttribute("data-bottom-bar");
  }, [hasActions]);

  if (!hasActions) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e6e9ee] bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-white/10 dark:bg-night/95 lg:hidden">
      <div className="mx-auto flex max-w-xl gap-2">
        {isBookable ? (
          <PetPlaceBookCta place={place} handleDeepLink={false} className="min-h-12 min-w-0 flex-[1.3] whitespace-nowrap px-2" />
        ) : null}
        {contactHref ? (
          <a
            href={contactHref}
            target={contactIsWhatsApp ? "_blank" : undefined}
            rel={contactIsWhatsApp ? "noopener noreferrer" : undefined}
            className={isBookable ? SECONDARY : PRIMARY}
          >
            <HugeiconsIcon icon={contactIsWhatsApp ? WhatsappIcon : Call02Icon} size={18} strokeWidth={1.5} aria-hidden />
            {contactIsWhatsApp ? "WhatsApp" : "Llamar"}
          </a>
        ) : null}
        {links.directionsHref ? (
          <a
            href={links.directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={!isBookable && !contactHref ? PRIMARY : SECONDARY}
          >
            <HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={1.5} aria-hidden />
            Cómo llegar
          </a>
        ) : null}
      </div>
    </div>
  );
}
