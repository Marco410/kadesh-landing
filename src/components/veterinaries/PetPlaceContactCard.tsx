"use client";

import { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Call02Icon,
  Facebook01Icon,
  Globe02Icon,
  InstagramIcon,
  Linkedin01Icon,
  LinkSquare02Icon,
  Mail01Icon,
  MapPinIcon,
  NewTwitterIcon,
  TiktokIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import VeterinariesMap from "./VeterinariesMap";
import { detailToMapPlace } from "./detail/mapPlace";
import { hasCoords, httpUrl, type PlaceLinks } from "./detail/placeLinks";
import type { PetPlaceDetail } from "./types";

/** Close enough to read the streets around the clinic. */
const PLACE_MAP_ZOOM = 16;

function socialIcon(network: string | null) {
  switch (network) {
    case "Instagram":
      return InstagramIcon;
    case "Facebook":
      return Facebook01Icon;
    case "X":
      return NewTwitterIcon;
    case "LinkedIn":
      return Linkedin01Icon;
    case "TikTok":
      return TiktokIcon;
    default:
      return LinkSquare02Icon;
  }
}

function ContactLine({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof MapPinIcon;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#f2f4f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:hover:bg-white/[0.06]"
      >
        <HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} className="shrink-0 text-kadesh dark:text-kadesh-300" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">{label}</span>
          <span className="block truncate text-[0.9375rem] font-semibold text-[#121212] dark:text-white">{value}</span>
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          strokeWidth={2}
          className="shrink-0 text-[#9aa3b2] transition-transform group-hover:translate-x-0.5 group-hover:text-kadesh"
          aria-hidden
        />
      </a>
    </li>
  );
}

/**
 * Where it is and how to reach it: a close map, the address with «Cómo llegar», then phone,
 * WhatsApp, email, website and social networks. Only what the clinic has.
 */
export default function PetPlaceContactCard({ place, links }: { place: PetPlaceDetail; links: PlaceLinks }) {
  const mapPlaces = useMemo(() => [detailToMapPlace(place)], [place]);
  const socials = (place.pet_place_social_media ?? []).filter((social) => social.link?.trim());
  const addressLines = [links.street, [links.locality, links.postal].filter(Boolean).join(" · ")].filter(Boolean);
  const hasContact = Boolean(links.phone || links.whatsapp || links.email || links.websiteHref || socials.length);

  return (
    <section
      aria-labelledby="ubicacion-titulo"
      className="overflow-hidden rounded-3xl border border-[#e6e9ee] bg-white shadow-[0_10px_30px_-12px_rgba(15,35,80,0.18)] dark:border-white/10 dark:bg-night-raised dark:shadow-none"
    >
      {hasCoords(place) ? (
        <div className="h-56 border-b border-[#e6e9ee] dark:border-white/10">
          <VeterinariesMap places={mapPlaces} selectedPlace={null} onPlaceClick={() => {}} height="100%" focusZoom={PLACE_MAP_ZOOM} />
        </div>
      ) : null}

      <div className="p-5">
        <h2 id="ubicacion-titulo" className="sr-only">
          Ubicación y contacto
        </h2>
        {addressLines.length > 0 ? (
          <div className="flex items-start gap-3 px-2">
            <HugeiconsIcon icon={MapPinIcon} size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-kadesh dark:text-kadesh-300" aria-hidden />
            <div className="min-w-0">
              <address className="not-italic text-[0.9375rem] leading-snug text-[#121212] dark:text-white">
                {addressLines.map((line) => (
                  <span key={line} className="block first:font-semibold">
                    {line}
                  </span>
                ))}
              </address>
              {links.directionsHref ? (
                <a
                  href={links.directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-kadesh underline-offset-4 hover:underline dark:text-kadesh-300 lg:min-h-0"
                >
                  Cómo llegar
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} aria-hidden />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasContact ? (
          <ul className={`flex flex-col ${addressLines.length > 0 ? "mt-4 border-t border-[#eef0f3] pt-3 dark:border-white/10" : ""}`}>
            {links.phone && links.phoneHref ? <ContactLine icon={Call02Icon} label="Teléfono" value={links.phone} href={links.phoneHref} /> : null}
            {links.whatsapp && links.whatsappHref ? (
              <ContactLine icon={WhatsappIcon} label="WhatsApp" value={links.whatsapp} href={links.whatsappHref} external />
            ) : null}
            {links.email && links.emailHref ? <ContactLine icon={Mail01Icon} label="Correo" value={links.email} href={links.emailHref} /> : null}
            {links.website && links.websiteHref ? (
              <ContactLine
                icon={Globe02Icon}
                label="Sitio web"
                value={links.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                href={links.websiteHref}
                external
              />
            ) : null}
          </ul>
        ) : (
          <p className="mt-4 px-2 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
            Aún no hay teléfono ni redes. Si es tu clínica, reclámala para agregarlos.
          </p>
        )}

        {socials.length > 0 ? (
          <nav aria-label="Redes sociales" className="mt-3 flex flex-wrap gap-1 px-1">
            {socials.map((social, index) => (
              <a
                key={`${social.social_media}-${social.link}-${index}`}
                href={httpUrl(social.link || "")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.social_media || "Red social"}
                title={social.social_media || "Red social"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#3a3a3a] transition-colors hover:bg-[#f2f4f7] hover:text-kadesh dark:text-[#c3c9d3] dark:hover:bg-white/[0.06] dark:hover:text-kadesh-300"
              >
                <HugeiconsIcon icon={socialIcon(social.social_media)} size={20} strokeWidth={1.5} aria-hidden />
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
