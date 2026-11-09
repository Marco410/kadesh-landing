"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { AppPageHeader } from "kadesh/components/app-shell";
import { PROFILE_VIEWS } from "kadesh/components/profile/shell/profileNav";
import { useProfileDetailCrumb } from "kadesh/components/profile/shell/ProfileShell";
import RescueOnboardingForm from "kadesh/components/rescue/RescueOnboardingForm";
import { Routes } from "kadesh/core/routes";

/**
 * Activar un espacio de rescate (dentro del panel; el shell ya exige sesión). Al terminar abre el
 * espacio en `/perfil?tab=rescate&org=<id>`.
 */
export default function ActivarRescatePage() {
  useProfileDetailCrumb("Activar espacio");

  return (
    <div className="w-full max-w-3xl">
      <AppPageHeader
        eyebrow={
          <Link
            href={Routes.profileRescue()}
            className="inline-flex items-center gap-1 rounded transition-colors hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} aria-hidden />
            {PROFILE_VIEWS.rescate.label}
          </Link>
        }
        title="Activa tu espacio de rescate"
        description="Gratis para rescatistas, refugios, hogares temporales y colectivos. Lo usas desde hoy; tu perfil se hace público cuando lo verificamos."
      />
      <RescueOnboardingForm />
    </div>
  );
}
