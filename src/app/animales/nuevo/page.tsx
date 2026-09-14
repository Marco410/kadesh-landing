"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "kadesh/components/layout";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import NewAnimalForm from "kadesh/components/animals/nuevo/NewAnimalForm";
import NewAnimalFormSkeleton from "kadesh/components/animals/nuevo/NewAnimalFormSkeleton";

const PAGE_SHELL =
  "flex h-dvh flex-col overflow-hidden bg-[#f7f8fa] pt-[72px] dark:bg-night";

function NewAnimalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const requestedStatus = searchParams.get("status");

  useEffect(() => {
    if (!userLoading && !user) {
      const next = requestedStatus
        ? `${Routes.animals.new}?status=${encodeURIComponent(requestedStatus)}`
        : Routes.animals.new;
      router.push(
        `${Routes.auth.login}?redirect=${encodeURIComponent(next)}&tab=register`,
      );
    }
  }, [user, userLoading, router, requestedStatus]);

  if (userLoading || !user) {
    return (
      <main className={PAGE_SHELL}>
        <Navigation />
        <NewAnimalFormSkeleton />
      </main>
    );
  }

  return (
    <main className={PAGE_SHELL}>
      <Navigation />
      <NewAnimalForm initialStatus={requestedStatus} />
    </main>
  );
}

export default function NewAnimalPage() {
  return (
    <Suspense
      fallback={
        <main className={PAGE_SHELL}>
          <Navigation />
          <NewAnimalFormSkeleton />
        </main>
      }
    >
      <NewAnimalPageContent />
    </Suspense>
  );
}
