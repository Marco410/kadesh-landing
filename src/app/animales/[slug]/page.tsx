"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Call02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";
import { motion } from "framer-motion";
import { useUiMotion } from "kadesh/components/shared/motion";
import {
  useAnimalDetail,
  AnimalImageGrid,
  AnimalInfoSection,
  LogTimeline,
  AnimalCommentsSection,
} from "kadesh/components/animals/detail";
import {
  getStatusColor,
  getStatusLabel,
} from "kadesh/components/animals/constants";

function directionsUrl(lat: string | number, lng: string | number) {
  const destination = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#f7f8fa] pt-[72px] dark:bg-night">
      <Navigation />
      {children}
    </main>
  );
}

const actionClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors lg:min-h-9";

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const motionPrefs = useUiMotion();
  const animalKey = (params?.slug || params?.id) as string;
  const { animal, logs, loading, error, refetch } = useAnimalDetail(
    animalKey || "",
  );

  useEffect(() => {
    if (!animal?.slug || animal.slug === animalKey) return;
    router.replace(Routes.animals.detail(animal.slug));
  }, [animal?.slug, animalKey, router]);

  if (loading) {
    return (
      <DetailShell>
        <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 px-3 py-3 lg:h-[calc(100dvh-72px)] lg:px-4">
          <div className="h-9 w-56 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10" />
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
            <div className="min-h-52 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10 lg:min-h-0" />
            <div className="min-h-52 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10 lg:min-h-0" />
          </div>
        </div>
      </DetailShell>
    );
  }

  if (error || !animal) {
    return (
      <DetailShell>
        <div className="mx-auto w-full max-w-[92rem] px-4 py-8">
          <Link
            href={Routes.animals.index}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-kadesh hover:underline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
            Animales
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-[#121212] dark:text-[#eef1f6]">
            {error ? "No se pudo cargar" : "No encontramos este animal"}
          </h1>
          <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            {error
              ? "Revisa tu conexión e inténtalo de nuevo."
              : "Puede que el reporte se haya eliminado."}
          </p>
        </div>
      </DetailShell>
    );
  }

  const lastLog = logs?.[0];
  const status = lastLog?.status || "register";
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const typeName = animal.animal_breed?.animal_type?.name || "";
  const hasCoords =
    lastLog?.lat != null &&
    lastLog?.lng != null &&
    !Number.isNaN(Number(lastLog.lat)) &&
    !Number.isNaN(Number(lastLog.lng));
  const phoneHref = animal.contactNumber
    ? `tel:${animal.contactNumber.replace(/[^\d+]/g, "")}`
    : null;
  const howToGetHref = hasCoords
    ? directionsUrl(lastLog.lat as number, lastLog.lng as number)
    : null;

  return (
    <DetailShell>
      <motion.div
        className="mx-auto flex w-full max-w-[92rem] flex-col px-3 lg:px-4"
        variants={motionPrefs.panel}
        initial={motionPrefs.panel ? "hidden" : false}
        animate="show"
      >
        <div className="flex min-h-0 flex-col gap-3 py-3 lg:h-[calc(100dvh-72px)] lg:overflow-hidden">
          <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2">
            <Link
              href={Routes.animals.index}
              className="inline-flex items-center gap-1 text-sm font-medium text-kadesh hover:underline"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
              Animales
            </Link>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h1 className="truncate text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6] sm:text-xl">
                {animal.name || "Sin nombre"}
              </h1>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {howToGetHref && (
                <motion.a
                  href={howToGetHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={motionPrefs.tap}
                  className={`${actionClass} border-2 border-kadesh text-kadesh hover:bg-kadesh hover:text-white`}
                >
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                  Cómo llegar
                </motion.a>
              )}
              {phoneHref && (
                <motion.a
                  href={phoneHref}
                  whileTap={motionPrefs.tap}
                  className={`${actionClass} bg-kadesh text-white hover:bg-kadesh-600`}
                >
                  <HugeiconsIcon
                    icon={Call02Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                  Llamar
                </motion.a>
              )}
            </div>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(17rem,1fr)_minmax(0,1.2fr)] lg:grid-rows-[auto_minmax(0,1fr)]">
            <div className="min-h-0 overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-white/10 dark:bg-night-raised lg:row-span-2">
              <AnimalImageGrid
                images={animal.multimedia}
                animalName={animal.name}
                typeName={typeName}
                statusColor={statusColor}
                fill
              />
            </div>
            <div className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
              <AnimalInfoSection animal={animal} />
            </div>
            <div className="min-h-0">
              <LogTimeline
                logs={logs ?? []}
                animal={animal}
                animalName={animal.name}
                onLogCreated={async () => {
                  await refetch();
                }}
              />
            </div>
          </div>
        </div>

        <div className="pb-6">
          <AnimalCommentsSection animal={animal} />
        </div>
      </motion.div>
    </DetailShell>
  );
}
