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

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
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
        <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10" />
            <div className="h-80 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10" />
          </div>
        </div>
      </DetailShell>
    );
  }

  if (error || !animal) {
    return (
      <DetailShell>
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 pb-8 sm:px-6">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={Routes.animals.index}
            className="inline-flex items-center gap-1 text-sm font-medium text-kadesh hover:underline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
            Animales
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6] sm:text-2xl">
                {animal.name || "Sin nombre"}
              </h1>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {howToGetHref && (
              <a
                href={howToGetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-kadesh px-5 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white"
              >
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={18}
                  strokeWidth={1.5}
                />
                Cómo llegar
              </a>
            )}
            {phoneHref && (
              <a
                href={phoneHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
              >
                <HugeiconsIcon icon={Call02Icon} size={18} strokeWidth={1.5} />
                Llamar
              </a>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-white/10 dark:bg-night-raised">
            <AnimalImageGrid
              images={animal.multimedia}
              animalName={animal.name}
              typeName={typeName}
              statusColor={statusColor}
            />
          </div>
          <div className="flex h-full flex-col rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised sm:p-6">
            <AnimalInfoSection animal={animal} />
          </div>
        </div>

        <LogTimeline
          logs={logs ?? []}
          animal={animal}
          animalName={animal.name}
          onLogCreated={async () => {
            await refetch();
          }}
        />

        <AnimalCommentsSection animal={animal} />
      </div>
    </DetailShell>
  );
}
