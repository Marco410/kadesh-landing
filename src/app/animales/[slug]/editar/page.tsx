"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "kadesh/components/layout";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { useAnimalDetail } from "kadesh/components/animals/detail";
import EditAnimalForm from "kadesh/components/animals/nuevo/EditAnimalForm";
import NewAnimalFormSkeleton from "kadesh/components/animals/nuevo/NewAnimalFormSkeleton";
import { canEditAnimal } from "kadesh/components/animals/canEditAnimal";

const PAGE_SHELL =
  "flex h-dvh flex-col overflow-hidden bg-[#f7f8fa] pt-[72px] dark:bg-night";

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const animalKey = (params?.slug || "") as string;
  const { user, loading: userLoading } = useUser();
  const { animal, loading } = useAnimalDetail(animalKey);

  // Dueño o admin de plataforma (el admin entra desde Operaciones de Kadesh).
  const canEdit = canEditAnimal(user, animal);
  const ready = !userLoading && !loading;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(
        `${Routes.auth.login}?redirect=${encodeURIComponent(Routes.animals.edit(animalKey))}`,
      );
    } else if (!canEdit) {
      router.replace(Routes.animals.detail(animalKey));
    }
  }, [ready, user, canEdit, animalKey, router]);

  return (
    <main className={PAGE_SHELL}>
      <Navigation />
      {ready && animal && canEdit ? (
        <EditAnimalForm key={animal.id} animal={animal} />
      ) : (
        <NewAnimalFormSkeleton />
      )}
    </main>
  );
}
