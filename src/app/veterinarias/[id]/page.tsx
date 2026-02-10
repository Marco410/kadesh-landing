"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Call02Icon,
  CalendarIcon,
  Clock01Icon,
  HealthIcon,
  HeartCheckIcon,
  Hospital01Icon,
  MapPinIcon,
  MedicalFileIcon,
  Medicine02Icon,
  StarIcon,
  Stethoscope02Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons';
import { Navigation, Footer } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import { GET_PET_PLACE } from 'kadesh/components/veterinaries/queries';
import { VeterinariesMap, PetPlaceReviewsSection } from 'kadesh/components/veterinaries';
import type { PetPlace, PetPlaceDetail, PetPlaceSchedule } from 'kadesh/components/veterinaries/types';

const SERVICE_ICONS = [
  Stethoscope02Icon,
  Medicine02Icon,
  HealthIcon,
  HeartCheckIcon,
  Hospital01Icon,
  MedicalFileIcon,
] as const;

function getServiceIcon(name: string | null, slug: string | null, index: number) {
  const text = `${name ?? ''} ${slug ?? ''}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (/\b(consulta|revision|general)\b/.test(text)) return Stethoscope02Icon;
  if (/\b(esteriliz|cirugia|quirurgic)\b/.test(text)) return Hospital01Icon;
  if (/\b(paliativ|cuidado|emergencia|urgencia)\b/.test(text)) return HeartCheckIcon;
  if (/\b(medicina|tratamiento|farmacia)\b/.test(text)) return Medicine02Icon;
  if (/\b(vacuna|prevencion|salud)\b/.test(text)) return HealthIcon;
  if (/\b(analisis|laboratorio|archivo)\b/.test(text)) return MedicalFileIcon;
  return SERVICE_ICONS[index % SERVICE_ICONS.length];
}

/** Converts detail place to PetPlace shape for the map component */
function detailToMapPlace(place: PetPlaceDetail): PetPlace {
  return {
    id: place.id,
    name: place.name,
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
      createdAt: '',
    })),
    pet_place_likes: [],
    services: place.services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: null,
      active: null,
      createdAt: '',
    })),
    types: [],
    user: place.user
      ? {
          id: place.user.id,
          name: place.user.name,
          lastName: place.user.lastName,
          username: place.user.username,
          email: '',
          phone: null,
          verified: place.user.verified,
          profileImage: place.user.profileImage,
        }
      : null,
    reviewsCount: place.reviewsCount ?? null,
    averageRating: place.averageRating ?? null,
  };
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
  '0': 'Domingo',
  '1': 'Lunes',
  '2': 'Martes',
  '3': 'Miércoles',
  '4': 'Jueves',
  '5': 'Viernes',
  '6': 'Sábado',
};

function formatDay(day: string): string {
  const key = String(day).toLowerCase();
  return DAY_LABELS[key] ?? day;
}

function formatTime(t: string | null): string {
  if (!t) return '—';
  return t;
}

/** Format time for display: "10" -> "10:00", "09:30" stays as is */
function formatTimeDisplay(t: string | number | null | undefined): string {
  if (t == null) return '—';
  const s = String(t).trim();
  if (!s) return '—';
  if (/^\d{1,2}$/.test(s)) return `${s}:00`;
  return s;
}

function formatScheduleRow(s: PetPlaceSchedule): string {
  const start = formatTime(s.timeIni);
  const end = formatTime(s.timeEnd);
  if (start === '—' && end === '—') return formatDay(s.day) + ': Cerrado';
  return `${formatDay(s.day)}: ${start} - ${end}`;
}

export default function VeterinaryDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data, loading, error, refetch } = useQuery<{ petPlace: PetPlaceDetail | null }>(GET_PET_PLACE, {
    variables: { where: { id } },
    skip: !id,
  });

  const place = data?.petPlace ?? null;

  if (!id) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <section className="w-full py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href={Routes.veterinaries.index}
              className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium hover:underline mb-6"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} /> Volver al directorio
            </Link>
            <p className="text-gray-600 dark:text-gray-400">No se encontró la veterinaria.</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <section className="w-full py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse" />
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 animate-pulse">
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !place) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <section className="w-full py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href={Routes.veterinaries.index}
              className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium hover:underline mb-6"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} /> Volver al directorio
            </Link>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <p className="text-gray-600 dark:text-gray-400">
                {error ? 'Error al cargar la veterinaria.' : 'No se encontró esta veterinaria.'}
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const displayName = place.name?.trim() || 'Veterinaria';
  const initial = (displayName[0] ?? 'V').toUpperCase();
  const locationLine = [place.municipality, place.state].filter(Boolean).join(', ') || place.address || place.street;
  const hasSchedules = place.pet_place_schedules?.length > 0;
  const hasServices = (place.services?.length ?? 0) > 0;
  const hasSocial = (place.pet_place_social_media?.length ?? 0) > 0;
  const mapPlace = detailToMapPlace(place);
  const hasValidCoords =
    !Number.isNaN(parseFloat(place.lat)) && !Number.isNaN(parseFloat(place.lng));

  const cardClass =
    'bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-[72px]">
      <Navigation />

      <section className="w-full py-6 sm:py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href={Routes.veterinaries.index}
              className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
              Directorio
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-none" title={displayName}>
              {displayName}
            </span>
          </nav>

          {/* Hero header */}
          <div
            className={`${cardClass} p-6 sm:p-8 bg-gradient-to-br from-white to-orange-50/30 dark:from-[#1a1a1a] dark:to-orange-950/10`}
          >
            <div className="flex flex-wrap gap-5 sm:gap-6 items-start">
              <span className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                {initial}
              </span>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 gap-y-2">
                  {(place.averageRating != null || (place.reviewsCount ?? 0) > 0) && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <HugeiconsIcon icon={StarIcon} size={18} className="fill-amber-500 text-amber-500" strokeWidth={1.5} />
                        {place.averageRating != null && (
                          <span className="font-bold text-gray-900 dark:text-white">{place.averageRating.toFixed(1)}</span>
                        )}
                      </span>
                      {(place.reviewsCount ?? 0) > 0 && (
                        <span>
                          {place.reviewsCount} reseña{(place.reviewsCount ?? 0) !== 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  )}
                  {place.isOpen != null && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        place.isOpen
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${place.isOpen ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {place.isOpen ? 'Abierto ahora' : 'Cerrado'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          {hasValidCoords && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Ubicación
              </p>
              <div className={`${cardClass} overflow-hidden`}>
                <VeterinariesMap
                  places={[mapPlace]}
                  selectedPlace={mapPlace}
                  onPlaceClick={() => {}}
                  height="320px"
                />
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Contact & location */}
            <div className={cardClass}>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  Ubicación y contacto
                </p>
                <div className="space-y-4">
                  {locationLine && (
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <HugeiconsIcon icon={MapPinIcon} size={18} className="text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pt-0.5" title={locationLine}>
                        {locationLine}
                      </p>
                    </div>
                  )}
                  {(place.address || place.street) && locationLine !== (place.street || place.address) && (
                    <p className="text-gray-500 dark:text-gray-500 text-sm pl-12">{place.street || place.address}</p>
                  )}
                  {place.phone && (
                    <a
                      href={`tel:${place.phone.replace(/\s/g, '')}`}
                      className="flex gap-3 items-center text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                    >
                      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <HugeiconsIcon icon={Call02Icon} size={18} strokeWidth={1.5} />
                      </span>
                      {place.phone}
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website.startsWith('http') ? place.website : `https://${place.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 items-center text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                    >
                      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <HugeiconsIcon icon={LinkSquare02Icon} size={18} strokeWidth={1.5} />
                      </span>
                      Visitar sitio web
                    </a>
                  )}
                  {!locationLine && !place.phone && !place.website && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">Sin información de contacto.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedules */}
            <div className={cardClass}>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  Horarios
                </p>
                {hasSchedules ? (
                  <ul className="space-y-2">
                    {place.pet_place_schedules.map((s, i) => {
                      const isClosed = formatTime(s.timeIni) === '—' && formatTime(s.timeEnd) === '—';
                      return (
                        <li
                          key={i}
                          className="flex justify-between items-center gap-4 py-3 px-3 -mx-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white">{formatDay(s.day)}</span>
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              Cerrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-900/50">
                              <HugeiconsIcon icon={Clock01Icon} size={16} className="flex-shrink-0 text-orange-500 dark:text-orange-400" strokeWidth={1.5} />
                              {formatTimeDisplay(s.timeIni)} – {formatTimeDisplay(s.timeEnd)} hrs
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500">Sin horarios registrados.</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {/* {place.description && (
            <div className={cardClass}>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  Descripción
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed whitespace-pre-line">
                  {place.description}
                </p>
              </div>
            </div>
          )} */}

          {/* Services */}
          {hasServices && (
            <div className={cardClass}>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                  Servicios
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {place.services.map((s, i) => {
                    const IconComponent = getServiceIcon(s.name, s.slug, i);
                    return (
                      <div
                        key={s.id}
                        className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors"
                      >
                        <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 text-orange-600 dark:text-orange-400">
                          <HugeiconsIcon icon={IconComponent} size={24} strokeWidth={1.5} />
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">
                          {s.name ?? 'Servicio'}
                        </span>
                        {s.description && (
                          <p
                            className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3"
                            title={s.description}
                          >
                            {s.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <PetPlaceReviewsSection place={place} refetchPlace={refetch} />

          {/* Social */}
          {hasSocial && (
            <div className={cardClass}>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  Redes sociales
                </p>
                <div className="flex flex-wrap gap-2">
                  {place.pet_place_social_media.map(
                    (s, i) =>
                      s.link && (
                        <a
                          key={i}
                          href={s.link.startsWith('http') ? s.link : `https://${s.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                        >
                          {s.social_media || 'Enlace'}
                        </a>
                      )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
