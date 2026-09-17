"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Routes } from "kadesh/core/routes";

/** Enlaces viejos a /reservar abren la ficha con el modal. */
export default function BookAppointmentRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  useEffect(() => {
    if (!slug) {
      router.replace(Routes.veterinaries.index);
      return;
    }
    router.replace(Routes.veterinaries.book(slug));
  }, [slug, router]);

  return null;
}
