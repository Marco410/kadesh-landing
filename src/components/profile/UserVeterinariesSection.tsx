"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  HospitalLocationIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
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
import ClinicManagePanel from "kadesh/components/profile/clinics/ClinicManagePanel";
import { useProfileMotion } from "./motion";

function statusLabel(place: MyPetPlace): { label: string; className: string } {
  if (place.verified || place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED) {
    return { label: "Verificada", className: "bg-green-600 text-white" };
  }
  if (place.claimStatus === PET_PLACE_CLAIM_STATUS.REJECTED) {
    return { label: "Rechazada", className: "bg-[#3a3a3a] text-white" };
  }
  return { label: "En revisión", className: "bg-amber-500 text-white" };
}

export default function UserVeterinariesSection({
  userId,
}: {
  userId: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
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

  if (loading && places.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10"
          />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <motion.div
        variants={motionPrefs.item}
        initial={motionPrefs.reduce ? false : "hidden"}
        animate="show"
        className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised"
      >
        <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">
          Aún no tienes una clínica
        </p>
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Busca tu ficha en el directorio y reclámala. Validamos por WhatsApp y
          luego podrás editar los datos.
        </p>
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
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
    );
  }

  return (
    <motion.ul
      className="space-y-3"
      variants={motionPrefs.list}
      initial={motionPrefs.reduce ? false : "hidden"}
      animate="show"
    >
      {places.map((place) => {
        const status = statusLabel(place);
        const canEdit =
          Boolean(place.verified) ||
          place.claimStatus === PET_PLACE_CLAIM_STATUS.VERIFIED;
        const open = openId === place.id;
        const types = formatPetPlaceTypeLabels(place.types);
        return (
          <motion.li
            key={place.id}
            variants={motionPrefs.item}
            layout
            className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised"
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
                  <p className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-[#121212] dark:text-[#eef1f6]">
                    <span className="truncate">{place.name}</span>
                    {canEdit ? <VerifiedBadge size={16} /> : null}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                  {[place.municipality, place.state]
                    .filter(Boolean)
                    .join(", ") || "Sin ubicación"}
                </p>
                {types ? (
                  <p className="mt-0.5 break-words text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                    {types}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={veterinaryDetailHref(place)}
                    className="inline-flex min-h-11 items-center rounded-xl border-2 border-kadesh px-3 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white"
                  >
                    Ver ficha
                  </Link>
                  {canEdit ? (
                    <motion.button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : place.id)}
                      whileTap={motionPrefs.tap}
                      className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-3 text-sm font-semibold text-white hover:bg-kadesh-600"
                    >
                      {open ? "Cerrar" : "Administrar"}
                    </motion.button>
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
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-3 text-sm font-semibold text-white hover:bg-kadesh-600"
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
            <AnimatePresence initial={false}>
              {canEdit && open ? (
                <motion.div
                  key="manage"
                  variants={motionPrefs.expand}
                  initial={motionPrefs.reduce ? false : "hidden"}
                  animate="show"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <ClinicManagePanel place={place} onSaved={() => refetch()} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
