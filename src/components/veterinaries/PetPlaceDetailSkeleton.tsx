import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";

function Bone({ className }: { className: string }) {
  return (
    <div className={`bg-[#e8edf3] dark:bg-white/15 ${className}`} aria-hidden />
  );
}

export default function PetPlaceDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col gap-3 px-4 py-3 pb-24 motion-reduce:[&_.animate-pulse]:animate-none lg:px-6"
    >
      <span className="sr-only">Cargando veterinaria</span>

      <header className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex self-start items-center gap-1 text-sm font-medium text-kadesh hover:underline"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
          Directorio
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Bone className="h-10 w-8 shrink-0 animate-pulse rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-7 w-56 max-w-full animate-pulse rounded-lg sm:w-72" />
            <Bone className="h-4 w-36 animate-pulse rounded-md" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-auto lg:shrink-0 lg:flex-row lg:flex-wrap lg:justify-end">
          <Bone className="h-11 w-full animate-pulse rounded-xl lg:w-40" />
          <div className="flex w-full gap-2 sm:w-auto">
            <Bone className="h-11 flex-1 animate-pulse rounded-xl sm:w-32 sm:flex-none" />
            <Bone className="h-11 w-11 shrink-0 animate-pulse rounded-xl" />
            <Bone className="h-11 flex-1 animate-pulse rounded-xl sm:w-28 sm:flex-none" />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-3 lg:grid-cols-2">
        <div className="grid min-h-0 w-full grid-rows-[240px_auto] gap-3 sm:grid-rows-[280px_auto] lg:h-[calc(100dvh-8.5rem)] lg:grid-rows-2">
          <Bone className="min-h-0 animate-pulse rounded-2xl" />
          <section className="flex min-h-0 flex-col gap-2 overflow-hidden rounded-2xl border-2 border-[#ececec] bg-white p-4 dark:border-white/15 dark:bg-night-raised lg:p-5">
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <Bone className="h-6 w-28 animate-pulse rounded-lg" />
              <div className="flex gap-1">
                <Bone className="h-10 w-10 animate-pulse rounded-xl sm:h-11 sm:w-11" />
                <Bone className="h-10 w-10 animate-pulse rounded-xl sm:h-11 sm:w-11" />
                <Bone className="h-10 w-10 animate-pulse rounded-xl sm:h-11 sm:w-11" />
              </div>
            </div>
            <Bone className="mt-2 min-h-[4.25rem] animate-pulse rounded-2xl" />
            <Bone className="min-h-[4.25rem] animate-pulse rounded-2xl" />
            <Bone className="min-h-[4.25rem] animate-pulse rounded-2xl" />
          </section>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
            <Bone className="mb-3 h-4 w-20 animate-pulse rounded-md" />
            <Bone className="mb-2 h-5 w-full animate-pulse rounded-md" />
            <Bone className="h-5 w-2/3 animate-pulse rounded-md" />
          </section>
          <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
            <Bone className="mb-3 h-4 w-24 animate-pulse rounded-md" />
            <div className="flex flex-wrap gap-1.5">
              <Bone className="h-8 w-28 animate-pulse rounded-lg" />
              <Bone className="h-8 w-32 animate-pulse rounded-lg" />
              <Bone className="h-8 w-20 animate-pulse rounded-lg" />
              <Bone className="h-8 w-36 animate-pulse rounded-lg" />
            </div>
          </section>
          <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised">
            <Bone className="mb-4 h-4 w-28 animate-pulse rounded-md" />
            <div className="space-y-3">
              <div className="flex gap-3">
                <Bone className="h-10 w-10 shrink-0 animate-pulse rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Bone className="h-4 w-40 animate-pulse rounded-md" />
                  <Bone className="h-3 w-full animate-pulse rounded-md" />
                  <Bone className="h-3 w-4/5 animate-pulse rounded-md" />
                </div>
              </div>
              <div className="flex gap-3">
                <Bone className="h-10 w-10 shrink-0 animate-pulse rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Bone className="h-4 w-32 animate-pulse rounded-md" />
                  <Bone className="h-3 w-full animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
