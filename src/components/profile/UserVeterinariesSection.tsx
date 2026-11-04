"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  HospitalLocationIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { AppPageHeader, dashButtonClass } from "kadesh/components/app-shell";
import { Routes } from "kadesh/core/routes";
import { veterinaryDetailHref } from "kadesh/components/veterinaries/petPlaceSlug";
import VerifiedBadge from "kadesh/components/veterinaries/VerifiedBadge";
import {
  PET_PLACE_CLAIM_STATUS,
  formatPetPlaceTypeLabels,
} from "kadesh/components/veterinaries/constants";
import { claimWhatsAppUrl } from "kadesh/components/veterinaries/claimWhatsApp";
import {
  GET_MY_PET_PLACES_QUERY,
  type GetMyPetPlacesResponse,
  type GetMyPetPlacesVariables,
  type MyPetPlace,
} from "kadesh/components/veterinaries/queries";
import ClinicManagePanel, {
  isClinicViewKey,
  type ClinicViewKey,
} from "kadesh/components/profile/clinics/ClinicManagePanel";
import {
  PROFILE_VIEWS,
  profileGroupTitle,
} from "kadesh/components/profile/shell/profileNav";
import { useProfileDetailCrumb } from "kadesh/components/profile/shell/ProfileShell";
import { useProfileMotion } from "./motion";

function canManage(place: MyPetPlace): boolean {
  return Boolean(place.verified) || place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED;
}

/** Encabezado de la lista de clínicas (lo pinta la sección: en el detalle el título es la clínica). */
function ClinicsHeader() {
  return (
    <AppPageHeader
      eyebrow={profileGroupTitle("clinics")}
      title={PROFILE_VIEWS.clinics.label}
      description={PROFILE_VIEWS.clinics.description}
    />
  );
}

function statusLabel(place: MyPetPlace): { label: string; className: string } {
  if (place.verified || place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED) {
    return { label: "Verificada", className: "bg-green-600 text-white" };
  }
  if (place.claimStatus === PET_PLACE_CLAIM_STATUS.REJECTED) {
    return { label: "Rechazada", className: "bg-dash-surface-3 text-dash-soft" };
  }
  return { label: "En revisión", className: "bg-amber-500 text-white" };
}

export default function UserVeterinariesSection({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicId = searchParams.get("clinic");
  const vista = searchParams.get("vista");
  const motionPrefs = useProfileMotion();
  const { data, loading, refetch } = useQuery<
    GetMyPetPlacesResponse,
    GetMyPetPlacesVariables
  >(GET_MY_PET_PLACES_QUERY, {
    variables: {
      where: { user: { id: { equals: userId } } },
      orderBy: [{ createdAt: "desc" }],
    },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const places = data?.petPlaces ?? [];
  const selected = clinicId ? places.find((place) => place.id === clinicId) ?? null : null;
  const managed = selected && canManage(selected) ? selected : null;
  useProfileDetailCrumb(managed?.name);

  if (managed) {
    const view: ClinicViewKey = isClinicViewKey(vista) ? vista : "datos";
    return (
      <div>
        <AppPageHeader
          eyebrow={
            <Link
              href={Routes.profileTab("clinics")}
              className="inline-flex items-center gap-1 rounded transition-colors hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} aria-hidden />
              Clínicas
            </Link>
          }
          title={managed.name}
          description={[managed.municipality, managed.state].filter(Boolean).join(", ") || undefined}
          actions={
            <Link href={veterinaryDetailHref(managed)} className={dashButtonClass({ variant: "outline", size: "sm" })}>
              Ver ficha pública
            </Link>
          }
        />
        <ClinicManagePanel
          place={managed}
          view={view}
          onViewChange={(next) => router.replace(Routes.profileClinic(managed.id, next), { scroll: false })}
          onSaved={() => refetch()}
        />
      </div>
    );
  }

  if (loading && places.length === 0) {
    return (
      <div className="space-y-2">
        <ClinicsHeader />
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-24 dash-shimmer rounded-3xl"
          />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <>
      <ClinicsHeader />
      <motion.div
        variants={motionPrefs.item}
        initial={motionPrefs.reduce ? false : "hidden"}
        animate="show"
        className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash"
      >
        <p className="font-semibold text-dash-ink">
          Aún no tienes una clínica
        </p>
        <p className="text-sm text-dash-muted">
          Busca tu ficha en el directorio y reclámala. Validamos por WhatsApp y
          luego podrás editar los datos.
        </p>
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex min-h-11 items-center gap-1.5 px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
        >
          Ir al directorio
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
      </motion.div>
      </>
    );
  }

  return (
    <>
    <ClinicsHeader />
    <motion.ul
      className="space-y-3"
      variants={motionPrefs.list}
      initial={motionPrefs.reduce ? false : "hidden"}
      animate="show"
    >
      {places.map((place) => {
        const status = statusLabel(place);
        const canEdit = canManage(place);
        const types = formatPetPlaceTypeLabels(place.types);
        return (
          <motion.li
            key={place.id}
            variants={motionPrefs.item}
            className="rounded-3xl border border-dash-line bg-dash-surface p-4 shadow-dash"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
                <HugeiconsIcon
                  icon={HospitalLocationIcon}
                  size={22}
                  strokeWidth={1.5}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-dash-ink">
                    <span className="truncate">{place.name}</span>
                    {canEdit ? <VerifiedBadge size={16} /> : null}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-sm text-dash-muted">
                  {[place.municipality, place.state]
                    .filter(Boolean)
                    .join(", ") || "Sin ubicación"}
                </p>
                {types ? (
                  <p className="mt-0.5 break-words text-xs text-dash-muted">
                    {types}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={veterinaryDetailHref(place)}
                    className="inline-flex min-h-11 items-center px-3 text-sm font-semibold rounded-full border border-dash-line-strong bg-dash-surface text-dash-ink transition-colors hover:border-kadesh-400"
                  >
                    Ver ficha
                  </Link>
                  {canEdit ? (
                    <Link
                      href={Routes.profileClinic(place.id)}
                      className={dashButtonClass({ variant: "dark", size: "sm" })}
                    >
                      Administrar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          claimWhatsAppUrl({
                            placeName: place.name,
                            placeId: place.id,
                            role: "owner",
                            phone: place.claimPhone || "",
                          }),
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="inline-flex min-h-11 items-center gap-1.5 px-3 text-sm font-semibold rounded-full bg-dash-ink text-dash-on-ink transition-opacity hover:opacity-90"
                    >
                      <HugeiconsIcon
                        icon={WhatsappIcon}
                        size={16}
                        strokeWidth={1.5}
                      />
                      Validar por WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
    </>
  );
}
