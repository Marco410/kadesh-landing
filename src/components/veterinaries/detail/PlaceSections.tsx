"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AmbulanceIcon,
  Calendar03Icon,
  Car01Icon,
  HealthIcon,
  HeartCheckIcon,
  Hospital01Icon,
  MedicalFileIcon,
  Medicine02Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { CLAIM_SECTION_ID } from "../constants";
import type { PetPlaceDetail, PetPlaceSchedule } from "../types";
import { weekRows } from "./schedule";

/** Section of the main column: a heading and its content, separated from the previous one by a rule. */
export function PlaceSection({
  id,
  title,
  aside,
  children,
}: {
  id?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const headingId = id ? `${id}-titulo` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-24 border-t border-[#e6e9ee] pt-8 dark:border-white/10"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={headingId} className="text-xl font-black tracking-[-0.025em] text-[#121212] dark:text-white">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

const AMENITIES = [
  { key: "emergencies", icon: AmbulanceIcon, label: "Urgencias 24/7" },
  { key: "appointmentRequired", icon: Calendar03Icon, label: "Atiende con cita" },
  { key: "parking", icon: Car01Icon, label: "Estacionamiento" },
] as const;

export function placeAmenities(place: PetPlaceDetail) {
  return AMENITIES.filter((amenity) => Boolean(place[amenity.key]));
}

/**
 * Clinics imported from Google got a filler description («Place located at . Rating: 5/5 (7
 * reviews)»): it says nothing the page does not already show, so it is not shown.
 */
const FILLER_DESCRIPTION = /^place located at\b/i;

export function placeDescription(place: PetPlaceDetail): string | null {
  const text = place.description?.trim();
  if (!text || FILLER_DESCRIPTION.test(text)) return null;
  return text;
}

export function PlaceAbout({ place }: { place: PetPlaceDetail }) {
  const description = placeDescription(place);
  const amenities = placeAmenities(place);
  if (!description && amenities.length === 0) return null;

  return (
    <PlaceSection id="acerca" title="Acerca de">
      {description ? (
        <p className="max-w-[65ch] whitespace-pre-line text-[1.0625rem] leading-relaxed text-[#3a3a3a] [overflow-wrap:anywhere] dark:text-[#c3c9d3]">
          {description}
        </p>
      ) : null}
      {amenities.length > 0 ? (
        <ul className={`flex flex-wrap gap-2 ${description ? "mt-5" : ""}`}>
          {amenities.map((amenity) => (
            <li
              key={amenity.key}
              className="inline-flex items-center gap-2 rounded-full bg-[#f2f4f7] px-3.5 py-2 text-sm font-semibold text-[#121212] dark:bg-white/[0.06] dark:text-white"
            >
              <HugeiconsIcon icon={amenity.icon} size={18} strokeWidth={1.5} className="text-kadesh dark:text-kadesh-300" aria-hidden />
              {amenity.label}
            </li>
          ))}
        </ul>
      ) : null}
    </PlaceSection>
  );
}

const SERVICE_ICONS = [Stethoscope02Icon, Medicine02Icon, HealthIcon, HeartCheckIcon, Hospital01Icon, MedicalFileIcon] as const;

function serviceIcon(name: string | null, slug: string | null, index: number) {
  const text = `${name ?? ""} ${slug ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (/\b(consulta|revision|general)/.test(text)) return Stethoscope02Icon;
  if (/\b(esteriliz|cirugia|quirurgic)/.test(text)) return Hospital01Icon;
  if (/\b(paliativ|cuidado|emergencia|urgencia)/.test(text)) return HeartCheckIcon;
  if (/\b(medicina|tratamiento|farmacia)/.test(text)) return Medicine02Icon;
  if (/\b(vacuna|prevencion|salud)/.test(text)) return HealthIcon;
  if (/\b(analisis|laboratorio|archivo)/.test(text)) return MedicalFileIcon;
  return SERVICE_ICONS[index % SERVICE_ICONS.length];
}

export function PlaceServices({ services }: { services: PetPlaceDetail["services"] }) {
  if (services.length === 0) return null;
  return (
    <PlaceSection id="servicios" title="Servicios" aside={<span className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{services.length}</span>}>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
        {services.map((service, index) => (
          <li key={service.id} className="flex items-start gap-3 py-2">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15 dark:text-kadesh-300">
              <HugeiconsIcon icon={serviceIcon(service.name, service.slug, index)} size={18} strokeWidth={1.5} aria-hidden />
            </span>
            <span className="min-w-0 pt-1.5">
              <span className="block text-[0.9375rem] font-semibold leading-snug text-[#121212] dark:text-white">{service.name}</span>
              {service.description?.trim() ? (
                <span className="mt-0.5 block text-sm leading-snug text-[#5a5a5a] dark:text-[#9aa3b2]">{service.description}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </PlaceSection>
  );
}

export function PlaceHours({ schedules, isOpen }: { schedules: PetPlaceSchedule[]; isOpen: boolean | null }) {
  const rows = weekRows(schedules);
  if (!rows.some((row) => row.hours)) return null;
  return (
    <PlaceSection id="horario" title="Horario">
      <ul className="max-w-md">
        {rows.map((row) => (
          <li
            key={row.index}
            className={`flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-[0.9375rem] ${
              row.isToday ? "bg-kadesh-50 dark:bg-kadesh/15" : ""
            }`}
          >
            <span className={`flex items-center gap-2 ${row.isToday ? "font-bold text-[#121212] dark:text-white" : "text-[#3a3a3a] dark:text-[#c3c9d3]"}`}>
              {row.label}
              {row.isToday ? (
                <span className="rounded-full bg-kadesh px-2 py-0.5 text-[0.6875rem] font-bold text-white">
                  Hoy{isOpen != null ? ` · ${isOpen ? "abierto" : "cerrado"}` : ""}
                </span>
              ) : null}
            </span>
            {row.hours ? (
              <span className={`tabular-nums ${row.isToday ? "font-bold text-[#121212] dark:text-white" : "font-medium text-[#121212] dark:text-white"}`}>
                {row.hours}
              </span>
            ) : (
              <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">Cerrado</span>
            )}
          </li>
        ))}
      </ul>
    </PlaceSection>
  );
}

/**
 * Most clinics were imported from Google and have no hours or services yet. Instead of two empty
 * boxes, one note that says what is missing and how the clinic can fill it in.
 */
export function PlaceMissingInfo({ missing, hasPhone }: { missing: string[]; hasPhone: boolean }) {
  if (missing.length === 0) return null;
  const list = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} ni ${missing[missing.length - 1]}`;
  return (
    <div className="rounded-2xl bg-[#f5f6f8] px-5 py-4 dark:bg-white/[0.04]">
      <p className="text-[0.9375rem] leading-relaxed text-[#3a3a3a] dark:text-[#c3c9d3]">
        Esta ficha todavía no tiene {list}.{hasPhone ? " Llama antes de ir para confirmar." : ""}{" "}
        <a href={`#${CLAIM_SECTION_ID}`} className="font-semibold text-kadesh underline-offset-4 hover:underline dark:text-kadesh-300">
          ¿Trabajas aquí? Complétala
        </a>
      </p>
    </div>
  );
}
