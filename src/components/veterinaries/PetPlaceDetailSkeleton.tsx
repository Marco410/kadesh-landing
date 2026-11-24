import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#e8edf3] dark:bg-white/10 ${className}`} aria-hidden />;
}

/** Same frame as the page (header, main column, side card), so nothing jumps when it loads. */
export default function PetPlaceDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto w-full max-w-[80rem] px-4 pt-6 pb-32 motion-reduce:[&_.animate-pulse]:animate-none sm:px-6 lg:px-8 lg:pb-20"
    >
      <span className="sr-only">Cargando veterinaria</span>

      <header className="flex flex-col gap-5">
        <Link
          href={Routes.veterinaries.index}
          className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-kadesh hover:underline dark:text-kadesh-300 lg:min-h-0"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} aria-hidden />
          Directorio de veterinarias
        </Link>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Bone className="h-10 w-72 max-w-full rounded-xl sm:w-[28rem]" />
            <Bone className="h-5 w-56 rounded-md" />
            <Bone className="h-5 w-80 max-w-full rounded-md" />
          </div>
          <div className="flex gap-2">
            <Bone className="hidden h-11 w-36 rounded-xl lg:block" />
            <Bone className="hidden h-11 w-32 rounded-xl lg:block" />
            <Bone className="h-11 w-11 rounded-xl" />
            <Bone className="h-11 w-11 rounded-xl" />
          </div>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-x-16">
        <div className="space-y-10">
          <div className="space-y-3">
            <Bone className="h-6 w-32 rounded-lg" />
            <Bone className="h-4 w-full max-w-xl rounded-md" />
            <Bone className="h-4 w-2/3 max-w-md rounded-md" />
          </div>
          <div className="space-y-3 border-t border-[#e6e9ee] pt-8 dark:border-white/10">
            <Bone className="h-6 w-28 rounded-lg" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <Bone className="h-9 w-9 shrink-0 rounded-xl" />
                  <Bone className="h-4 w-40 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 border-t border-[#e6e9ee] pt-8 dark:border-white/10">
            <Bone className="h-6 w-28 rounded-lg" />
            <div className="flex items-center gap-8">
              <Bone className="h-14 w-20 rounded-xl" />
              <div className="w-full max-w-sm space-y-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <Bone key={index} className="h-2 w-full rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-[#e6e9ee] dark:border-white/10">
          <Bone className="h-56 rounded-none" />
          <div className="space-y-3 p-5">
            <Bone className="h-4 w-48 rounded-md" />
            <Bone className="h-4 w-36 rounded-md" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
