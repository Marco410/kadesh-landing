"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "kadesh/components/layout";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { useAnimalDetail } from "kadesh/components/animals/detail";
import EditAnimalForm from "kadesh/components/animals/nuevo/EditAnimalForm";
import NewAnimalFormSkeleton from "kadesh/components/animals/nuevo/NewAnimalFormSkeleton";

const PAGE_SHELL =
  "flex h-dvh flex-col overflow-hidden bg-[#f7f8fa] pt-[72px] dark:bg-night";

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const animalKey = (params?.slug || "") as string;
  const { user, loading: userLoading } = useUser();
  const { animal, loading } = useAnimalDetail(animalKey);

  const isOwner = Boolean(user?.id && animal?.user?.id === user.id);
  const ready = !userLoading && !loading;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(
        `${Routes.auth.login}?redirect=${encodeURIComponent(Routes.animals.edit(animalKey))}`,
      );
    } else if (!isOwner) {
      router.replace(Routes.animals.detail(animalKey));
    }
  }, [ready, user, isOwner, animalKey, router]);

  return (
    <main className={PAGE_SHELL}>
      <Navigation />
      {ready && animal && isOwner ? (
        <EditAnimalForm key={animal.id} animal={animal} />
      ) : (
        <NewAnimalFormSkeleton />
      )}
    </main>
  );
}
