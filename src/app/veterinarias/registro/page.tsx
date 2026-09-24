"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "kadesh/components/layout";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import RegisterVeterinaryForm from "kadesh/components/veterinaries/RegisterVeterinaryForm";
import NewAnimalFormSkeleton from "kadesh/components/animals/nuevo/NewAnimalFormSkeleton";

const PAGE_SHELL =
  "flex h-dvh flex-col overflow-hidden bg-[#f7f8fa] pt-[72px] dark:bg-night";

export default function RegisterVeterinaryPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(
        `${Routes.auth.login}?redirect=${encodeURIComponent(Routes.veterinaries.register)}&tab=register`,
      );
    }
  }, [loading, user, router]);

  return (
    <main className={PAGE_SHELL}>
      <Navigation />
      {loading || !user ? (
        <NewAnimalFormSkeleton />
      ) : (
        <RegisterVeterinaryForm key={user.id} />
      )}
    </main>
  );
}
