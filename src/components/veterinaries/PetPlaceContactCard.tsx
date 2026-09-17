"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Calendar02Icon,
  Car01Icon,
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
import type { PetPlaceDetail } from "./types";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function httpUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

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

function OutboundIconLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: typeof MapPinIcon;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-kadesh transition-colors hover:bg-kadesh-50 dark:hover:bg-kadesh/15"
    >
      <HugeiconsIcon
        icon={icon}
        size={20}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </a>
  );
}

function directionsUrl(lat: string, lng: string) {
  const destination = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function ContactRow({
  icon,
  label,
  value,
  href,
  action,
  external,
}: {
  icon: typeof MapPinIcon;
  label: string;
  value: string;
  href?: string | null;
  action?: string;
  external?: boolean;
}) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
        <HugeiconsIcon
          icon={icon}
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-[#5a5a5a] dark:text-[#9aa3b2]">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-base font-semibold text-[#121212] dark:text-white">
          {value}
        </span>
      </span>
      {action ? (
        <span className="shrink-0 text-sm font-semibold text-kadesh">
          {action}
        </span>
      ) : null}
    </>
  );

  const className =
    "flex min-h-[4.25rem] items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-3 py-3 transition-colors dark:border-white/10 dark:bg-night";

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${className} hover:border-kadesh hover:bg-kadesh-50 dark:hover:bg-kadesh/10`}
    >
      {body}
    </a>
  );
}

export default function PetPlaceContactCard({
  place,
}: {
  place: PetPlaceDetail;
}) {
  const street = place.street?.trim() || "";
  const address = place.address?.trim() || "";
  const locality = [place.municipality, place.state].filter(Boolean).join(", ");
  const postal = place.cp?.trim() ? `C.P. ${place.cp.trim()}` : "";
  const addressValue = [street || address, locality, postal]
    .filter(Boolean)
    .join(" · ");
  const hasCoords =
    !Number.isNaN(parseFloat(place.lat)) &&
    !Number.isNaN(parseFloat(place.lng));
  const howToGetHref = hasCoords ? directionsUrl(place.lat, place.lng) : null;
  const phone = place.phone?.trim() || "";
  const phoneHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;
  const whatsapp = place.whatsapp?.trim() || "";
  const whatsappHref = whatsapp ? `https://wa.me/${digits(whatsapp)}` : null;
  const email = place.email?.trim() || "";
  const website = place.website?.trim() || "";
  const websiteHref = website ? httpUrl(website) : null;
  const socials = (place.pet_place_social_media ?? []).filter((social) =>
    social.link?.trim(),
  );
  const badges = [
    place.emergencies ? "Urgencias 24/7" : null,
    place.appointmentRequired ? "Solo con cita" : null,
    place.parking ? "Estacionamiento" : null,
  ].filter((badge): badge is string => Boolean(badge));

  const hasContact =
    Boolean(addressValue) ||
    Boolean(phone) ||
    Boolean(whatsapp) ||
    Boolean(email) ||
    Boolean(websiteHref) ||
    socials.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-[#ececec] bg-white p-4 shadow-sm dark:border-white/15 dark:bg-night-raised lg:p-5">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
          Contacto
        </h2>
        {websiteHref || socials.length > 0 ? (
          <nav
            aria-label="Sitio y redes"
            className="flex shrink-0 items-center"
          >
            {websiteHref ? (
              <OutboundIconLink
                href={websiteHref}
                icon={Globe02Icon}
                label="Sitio web"
              />
            ) : null}
            {socials.map((social, index) => (
              <OutboundIconLink
                key={`${social.social_media}-${social.link}-${index}`}
                href={httpUrl(social.link || "")}
                icon={socialIcon(social.social_media)}
                label={social.social_media || "Red social"}
              />
            ))}
          </nav>
        ) : null}
      </div>

      {badges.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <li
              key={badge}
              className="rounded-full bg-kadesh-50 px-2.5 py-1 text-xs font-semibold text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300"
            >
              {badge}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {addressValue ? (
          <ContactRow
            icon={MapPinIcon}
            label="Dirección"
            value={addressValue}
            href={howToGetHref}
            action={howToGetHref ? "Cómo llegar" : undefined}
            external
          />
        ) : null}
        {phone ? (
          <ContactRow
            icon={Call02Icon}
            label="Teléfono"
            value={phone}
            href={phoneHref}
            action="Llamar"
          />
        ) : null}
        {whatsapp ? (
          <ContactRow
            icon={WhatsappIcon}
            label="WhatsApp"
            value={whatsapp}
            href={whatsappHref}
            action="Escribir"
            external
          />
        ) : null}
        {email ? (
          <ContactRow
            icon={Mail01Icon}
            label="Correo"
            value={email}
            href={`mailto:${email}`}
            action="Enviar"
          />
        ) : null}
        {!hasContact ? (
          <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            Aún no hay datos de contacto. Si es tu clínica, reclámala para
            agregar teléfono, WhatsApp, correo y redes.
          </p>
        ) : null}
      </div>

      {place.appointmentRequired || place.parking ? (
        <p className="mt-3 flex flex-wrap gap-3 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          {place.appointmentRequired ? (
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={Calendar02Icon}
                size={14}
                strokeWidth={1.5}
              />
              Conviene agendar antes de ir
            </span>
          ) : null}
          {place.parking ? (
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon icon={Car01Icon} size={14} strokeWidth={1.5} />
              Hay estacionamiento
            </span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
