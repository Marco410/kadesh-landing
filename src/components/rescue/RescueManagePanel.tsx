"use client";

import { DashSectionCard, DashSegmented } from "kadesh/components/app-shell";
import { RESCUE_VIEWS, type RescueViewKey } from "./constants";
import RescueAnimalsView from "./RescueAnimalsView";
import RescueApplicationsView from "./RescueApplicationsView";
import RescuePetsView from "./RescuePetsView";
import RescueProfileForm from "./RescueProfileForm";
import RescueSummaryView from "./RescueSummaryView";
import RescueTeamView from "./RescueTeamView";
import type { RescueOrganization } from "./types";

/**
 * Administrar un espacio de rescate: segmentado con sus vistas y una tarjeta con la elegida.
 * La vista la controla la URL (`view`/`onViewChange`), igual que Clínicas.
 */
export default function RescueManagePanel({
  org,
  view,
  onViewChange,
  onChanged,
}: {
  org: RescueOrganization;
  view: RescueViewKey;
  onViewChange: (view: RescueViewKey) => void;
  /** Algo del espacio cambió (perfil, equipo): refresca la lista y el encabezado. */
  onChanged: () => void;
}) {
  const current = RESCUE_VIEWS.find((item) => item.key === view) ?? RESCUE_VIEWS[0];

  return (
    <div className="flex flex-col gap-4">
      <DashSegmented
        ariaLabel={`Secciones de ${org.name}`}
        value={current.key}
        onChange={onViewChange}
        items={RESCUE_VIEWS.map((item) => ({ id: item.key, label: item.label }))}
      />
      {current.key === "resumen" ? (
        <RescueSummaryView org={org} onGoTo={onViewChange} />
      ) : (
        // `key`: al cambiar de vista la tarjeta se remonta y repite su entrada.
        <DashSectionCard key={current.key} title={current.title} description={current.hint}>
          {current.key === "fichas" ? <RescuePetsView org={org} /> : null}
          {current.key === "animales" ? <RescueAnimalsView org={org} /> : null}
          {current.key === "solicitudes" ? <RescueApplicationsView org={org} /> : null}
          {current.key === "equipo" ? <RescueTeamView org={org} onChanged={onChanged} /> : null}
          {current.key === "perfil" ? <RescueProfileForm org={org} onSaved={onChanged} /> : null}
        </DashSectionCard>
      )}
    </div>
  );
}
