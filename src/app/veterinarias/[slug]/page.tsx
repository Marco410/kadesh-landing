"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Call02Icon,
  HealthIcon,
  HeartCheckIcon,
  Hospital01Icon,
  Location01Icon,
  MedicalFileIcon,
  PencilEdit02Icon,
  Medicine02Icon,
  StarIcon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { GET_PET_PLACE } from "kadesh/components/veterinaries/queries";
import { motion } from "framer-motion";
import { useUiMotion } from "kadesh/components/shared/motion";
import {
  VeterinariesMap,
  PetPlaceReviewsSection,
  ClaimPetPlaceSection,
  PetPlaceContactCard,
  VerifiedBadge,
  PetPlaceLikeButton,
  PetPlaceBookCta,
} from "kadesh/components/veterinaries";
import { getPetPlaceBookingMode } from "kadesh/components/veterinaries/appointments";
import { formatPetPlaceTypeLabels } from "kadesh/components/veterinaries/constants";
import { isPetPlaceKeystoneId } from "kadesh/components/veterinaries/petPlaceSlug";
import PetPlaceDetailSkeleton from "kadesh/components/veterinaries/PetPlaceDetailSkeleton";
import type {
  PetPlace,
  PetPlaceDetail,
  PetPlaceSchedule,
  PetPlaceWhereUniqueInput,
} from "kadesh/components/veterinaries/types";

const SERVICE_ICONS = [
  Stethoscope02Icon,
  Medicine02Icon,
  HealthIcon,
  HeartCheckIcon,
  Hospital01Icon,
  MedicalFileIcon,
] as const;

function getServiceIcon(
  name: string | null,
  slug: string | null,
  index: number,
) {
  const text = `${name ?? ""} ${slug ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (/\b(consulta|revision|general)\b/.test(text)) return Stethoscope02Icon;
  if (/\b(esteriliz|cirugia|quirurgic)\b/.test(text)) return Hospital01Icon;
  if (/\b(paliativ|cuidado|emergencia|urgencia)\b/.test(text))
    return HeartCheckIcon;
  if (/\b(medicina|tratamiento|farmacia)\b/.test(text)) return Medicine02Icon;
  if (/\b(vacuna|prevencion|salud)\b/.test(text)) return HealthIcon;
  if (/\b(analisis|laboratorio|archivo)\b/.test(text)) return MedicalFileIcon;
  return SERVICE_ICONS[index % SERVICE_ICONS.length];
}

function detailToMapPlace(place: PetPlaceDetail): PetPlace {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    description: place.description,
    phone: place.phone,
    address: place.address,
    street: place.street,
    state: place.state,
    country: place.country,
    cp: place.cp,
    municipality: place.municipality,
    lat: place.lat,
    lng: place.lng,
    distance: null,
    isOpen: place.isOpen,
    google_place_id: null,
    google_opening_hours: null,
    website: place.website,
    views: place.views,
    createdAt: place.createdAt,
    pet_place_reviews: [],
    pet_place_social_media: place.pet_place_social_media.map((s) => ({
      ...s,
      createdAt: "",
    })),
    pet_place_likes: [],
    services: place.services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: null,
      active: null,
      createdAt: "",
    })),
    types: place.types ?? [],
    user: place.user
      ? {
          id: place.user.id,
          name: place.user.name,
          lastName: place.user.lastName,
          username: place.user.username,
          email: "",
          phone: null,
          verified: place.user.verified,
          profileImage: place.user.profileImage,
        }
      : null,
    reviewsCount: place.reviewsCount ?? null,
    averageRating: place.averageRating ?? null,
    verified: place.verified ?? null,
  };
}

const WEEKDAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

const DAY_INDEX: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
  lunes: 0,
  martes: 1,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  domingo: 6,
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "0": 6,
};

function dayKey(day: string): string {
  return String(day)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function dayIndex(day: string): number {
  return DAY_INDEX[dayKey(day)] ?? -1;
}

function formatTimeDisplay(t: string | number | null | undefined): string {
  if (t == null) return "—";
  const s = String(t).trim();
  if (!s) return "—";
  if (/^\d{1,2}$/.test(s)) return `${s}:00`;
  return s;
}

function hoursKey(schedule: PetPlaceSchedule): string {
  const start = formatTimeDisplay(schedule.timeIni);
  const end = formatTimeDisplay(schedule.timeEnd);
  if (start === "—" && end === "—") return "closed";
  return `${start}|${end}`;
}

function formatDayRuns(indices: number[]): string {
  const unique = [...new Set(indices.filter((i) => i >= 0))].sort(
    (a, b) => a - b,
  );
  const runs: number[][] = [];
  for (const index of unique) {
    const last = runs[runs.length - 1];
    if (last && index === last[last.length - 1] + 1) {
      last.push(index);
    } else {
      runs.push([index]);
    }
  }

  const parts = runs.map((run) => {
    const first = WEEKDAYS[run[0]];
    const lastName = WEEKDAYS[run[run.length - 1]];
    if (run.length === 1) return first;
    if (run.length === 2) return `${first} y ${lastName.toLowerCase()}`;
    return `${first} a ${lastName.toLowerCase()}`;
  });

  if (parts.length <= 1) return parts[0] ?? "";
  const rest = parts
    .slice(1)
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1));
  if (rest.length === 1) return `${parts[0]} y ${rest[0]}`;
  return `${parts[0]}, ${rest.slice(0, -1).join(", ")} y ${rest[rest.length - 1]}`;
}

function groupSchedules(schedules: PetPlaceSchedule[]) {
  const byHours = new Map<string, number[]>();
  const unknown: PetPlaceSchedule[] = [];

  for (const schedule of schedules) {
    const index = dayIndex(schedule.day);
    if (index < 0) {
      unknown.push(schedule);
      continue;
    }
    const key = hoursKey(schedule);
    const days = byHours.get(key) ?? [];
    days.push(index);
    byHours.set(key, days);
  }

  const groups = [...byHours.entries()]
    .map(([key, days]) => {
      const closed = key === "closed";
      const [start, end] = closed ? ["", ""] : key.split("|");
      return {
        label: formatDayRuns(days),
        hours: closed ? "Cerrado" : `${start}–${end}`,
        closed,
        firstDay: Math.min(...days),
      };
    })
    .sort((a, b) => a.firstDay - b.firstDay);

  for (const schedule of unknown) {
    const start = formatTimeDisplay(schedule.timeIni);
    const end = formatTimeDisplay(schedule.timeEnd);
    const closed = start === "—" && end === "—";
    groups.push({
      label: String(schedule.day),
      hours: closed ? "Cerrado" : `${start}–${end}`,
      closed,
      firstDay: 99,
    });
  }

  return groups;
}

function directionsUrl(lat: string, lng: string) {
  const destination = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function VetPin() {
  return (
    <svg viewBox="0 0 36 44" className="h-10 w-8 flex-shrink-0" aria-hidden>
      <path
        fill="var(--color-kadesh)"
        stroke="#ffffff"
        strokeWidth="2"
        d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
      />
      <path fill="#ffffff" d="M13 10h10v2h-4v8h-2v-8h-4z" />
    </svg>
  );
}

function ScheduleList({ schedules }: { schedules: PetPlaceSchedule[] }) {
  const groups = groupSchedules(schedules);
  return (
    <ul className="min-h-0 overflow-y-auto text-sm">
      {groups.map((group) => (
        <li
          key={`${group.label}-${group.hours}`}
          className="flex items-center justify-between gap-3 border-b border-[#ececec] py-1.5 last:border-0 dark:border-white/10"
        >
          <span className="font-medium text-[#121212] dark:text-white">
            {group.label}
          </span>
          {group.closed ? (
            <span className="text-[#5a5a5a] dark:text-[#b0b0b0]">Cerrado</span>
          ) : (
            <span className="tabular-nums font-semibold text-kadesh">
              {group.hours}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-white pt-[72px] dark:bg-night">
      <Navigation />
      {children}
    </main>
  );
}

export default function VeterinaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const placeKey = typeof params?.slug === "string" ? params.slug : undefined;

  const { data, loading, error, refetch } = useQuery<
    { petPlace: PetPlaceDetail | null },
    { where: PetPlaceWhereUniqueInput }
  >(GET_PET_PLACE, {
    variables: {
      where: isPetPlaceKeystoneId(placeKey ?? "")
        ? { id: placeKey }
        : { slug: placeKey },
    },
    skip: !placeKey,
    fetchPolicy: "cache-and-network",
  });

  const place = data?.petPlace ?? null;
  const isOwnPlace = Boolean(user?.id && place?.user?.id === user.id);

  useEffect(() => {
    if (!place?.slug || !placeKey || place.slug === placeKey) return;
    router.replace(Routes.veterinaries.detail(place.slug));
  }, [place?.slug, placeKey, router]);

  if (!placeKey) {
    return (
      <DetailShell>
        <div className="mx-auto flex w-full max-w-[90rem] flex-1 items-start px-4 py-6 lg:px-6">
          <div>
            <Link
              href={Routes.veterinaries.index}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-kadesh hover:underline"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Directorio
            </Link>
            <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              No se encontró esta veterinaria.
            </p>
          </div>
        </div>
      </DetailShell>
    );
  }

  if (loading && !place) {
    return (
      <DetailShell>
        <PetPlaceDetailSkeleton />
      </DetailShell>
    );
  }

  if (error || !place) {
    return (
      <DetailShell>
        <div className="mx-auto flex w-full max-w-[90rem] flex-1 items-start px-4 py-6 lg:px-6">
          <div>
            <Link
              href={Routes.veterinaries.index}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-kadesh hover:underline"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              Directorio
            </Link>
            <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              {error
                ? "Error al cargar la veterinaria."
                : "No se encontró esta veterinaria."}
            </p>
          </div>
        </div>
      </DetailShell>
    );
  }

  const displayName = place.name?.trim() || "Veterinaria";
  const hasSchedules = (place.pet_place_schedules?.length ?? 0) > 0;
  const services = (place.services ?? []).filter(
    (service) => service.active !== false && Boolean(service.name?.trim()),
  );
  const mapPlace = detailToMapPlace(place);
  const hasValidCoords =
    !Number.isNaN(parseFloat(place.lat)) &&
    !Number.isNaN(parseFloat(place.lng));
  const phoneHref = place.phone
    ? `tel:${place.phone.replace(/\s/g, "")}`
    : null;
  const howToGetHref = hasValidCoords
    ? directionsUrl(place.lat, place.lng)
    : null;
  const isBookable = getPetPlaceBookingMode(place.types) !== null;
  const typeLine = formatPetPlaceTypeLabels(place.types);

  return (
    <DetailShell>
      <motion.div
        className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col gap-3 px-4 py-3 pb-24 lg:px-6"
        variants={motionPrefs.panel}
        initial={motionPrefs.panel ? "hidden" : false}
        animate="show"
      >
        <header className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <Link
            href={Routes.veterinaries.index}
            className="inline-flex self-start items-center gap-1 text-sm font-medium text-kadesh hover:underline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
            Directorio
          </Link>

          <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center">
            <VetPin />
            <div className="min-w-0 flex-1">
              <h1 className="flex min-w-0 items-center gap-2 text-pretty text-xl font-black leading-tight tracking-[-0.03em] text-[#121212] dark:text-white sm:text-2xl">
                <span className="min-w-0 lg:truncate">{displayName}</span>
                {place.verified ? <VerifiedBadge size={22} /> : null}
              </h1>
              {typeLine ? (
                <p className="mt-1 break-words text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                  {typeLine}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {(place.averageRating != null ||
                  (place.reviewsCount ?? 0) > 0) && (
                  <span className="inline-flex items-center gap-1 text-[#121212] dark:text-white">
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={14}
                      className="fill-amber-500 text-amber-500"
                      strokeWidth={1.5}
                    />
                    {place.averageRating != null && (
                      <span className="font-semibold">
                        {place.averageRating.toFixed(1)}
                      </span>
                    )}
                    {(place.reviewsCount ?? 0) > 0 && (
                      <span className="text-[#5a5a5a] dark:text-[#b0b0b0]">
                        · {place.reviewsCount} reseña
                        {(place.reviewsCount ?? 0) !== 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                )}
                {place.isOpen != null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      place.isOpen
                        ? "bg-green-600 text-white"
                        : "bg-[#3a3a3a] text-white"
                    }`}
                  >
                    {place.isOpen ? "Abierto" : "Cerrado"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0 lg:flex-row lg:flex-wrap lg:justify-end">
            {isOwnPlace && (
              <Link
                href={`${Routes.profile}?tab=clinics&clinic=${place.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={18} strokeWidth={1.5} />
                Editar mi ficha
              </Link>
            )}
            <PetPlaceBookCta place={place} />
            <div className="flex w-full gap-2 sm:w-auto">
              {howToGetHref && (
                <motion.a
                  href={howToGetHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={motionPrefs.tap}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-kadesh px-3 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white sm:flex-none sm:px-5"
                >
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={18}
                    strokeWidth={1.5}
                  />
                  Cómo llegar
                </motion.a>
              )}
              <PetPlaceLikeButton
                petPlaceId={place.id}
                initialCount={place.pet_place_likesCount ?? 0}
              />
              {phoneHref && (
                <motion.a
                  href={phoneHref}
                  whileTap={motionPrefs.tap}
                  className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors sm:flex-none sm:px-5 ${
                    isBookable
                      ? "border-2 border-kadesh text-kadesh hover:bg-kadesh hover:text-white"
                      : "bg-kadesh text-white hover:bg-kadesh-600"
                  }`}
                >
                  <HugeiconsIcon
                    icon={Call02Icon}
                    size={18}
                    strokeWidth={1.5}
                  />
                  Llamar
                </motion.a>
              )}
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-3 lg:grid-cols-2">
          <div className="grid min-h-0 w-full grid-rows-[240px_auto] gap-3 sm:grid-rows-[280px_auto] lg:sticky lg:top-[5.5rem] lg:h-[calc(100dvh-8.5rem)] lg:grid-rows-2">
            {hasValidCoords ? (
              <div className="min-h-0 overflow-hidden rounded-2xl border border-[#ececec] dark:border-white/10">
                <VeterinariesMap
                  places={[mapPlace]}
                  selectedPlace={null}
                  onPlaceClick={() => {}}
                  height="100%"
                />
              </div>
            ) : (
              <div className="flex min-h-0 items-center justify-center rounded-2xl border border-[#ececec] text-sm text-[#5a5a5a] dark:border-white/10 dark:text-[#b0b0b0]">
                Sin coordenadas para el mapa.
              </div>
            )}

            <PetPlaceContactCard place={place} />
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <div className="shrink-0 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
              <h2 className="mb-2 text-sm font-bold text-[#121212] dark:text-white">
                Horarios
              </h2>
              {hasSchedules ? (
                <ScheduleList schedules={place.pet_place_schedules} />
              ) : (
                <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                  Sin horarios registrados.
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
              <h2 className="mb-2 text-sm font-bold text-[#121212] dark:text-white">
                Servicios
              </h2>
              {services.length > 0 ? (
                <motion.ul
                  className="flex flex-wrap gap-1.5"
                  variants={motionPrefs.list}
                  initial={motionPrefs.list ? "hidden" : false}
                  animate="show"
                >
                  {services.map((service, index) => {
                    const IconComponent = getServiceIcon(
                      service.name,
                      service.slug,
                      index,
                    );
                    return (
                      <motion.li
                        key={service.id}
                        variants={motionPrefs.item}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-kadesh-50 px-2.5 py-1.5 text-xs font-medium text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300"
                      >
                        <HugeiconsIcon
                          icon={IconComponent}
                          size={14}
                          strokeWidth={1.5}
                        />
                        {service.name}
                      </motion.li>
                    );
                  })}
                </motion.ul>
              ) : (
                <p className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                  Sin servicios registrados.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
              <PetPlaceReviewsSection place={place} refetchPlace={refetch} />
            </div>
          </div>
        </div>

        <ClaimPetPlaceSection place={place} onClaimed={() => refetch()} />
      </motion.div>
    </DetailShell>
  );
}
