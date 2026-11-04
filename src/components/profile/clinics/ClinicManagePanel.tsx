"use client";

import { DashSectionCard, DashSegmented } from "kadesh/components/app-shell";
import type { MyPetPlace } from "kadesh/components/veterinaries/queries";
import ClinicAppointmentsCalendar from "./ClinicAppointmentsCalendar";
import ClinicDataForm from "./ClinicDataForm";
import ClinicHoursForm from "./ClinicHoursForm";
import ClinicServicesForm from "./ClinicServicesForm";

/** Secciones de una clínica. La clave va en la URL: `/perfil?tab=clinics&clinic=<id>&vista=<clave>`. */
export const CLINIC_VIEWS = [
  {
    key: "datos",
    label: "Datos",
    title: "Datos del negocio",
    hint: "Nombre, tipo, contacto y dirección. Esto es lo que sale en la ficha pública.",
  },
  {
    key: "horarios",
    label: "Horarios",
    title: "Horario de apertura",
    hint: "Un renglón por día. Los días apagados no aparecen en la ficha.",
  },
  {
    key: "servicios",
    label: "Servicios",
    title: "Servicios que ofreces",
    hint: "Busca y marca. Si no está, pídelo: lo revisamos y solo entonces sale en el catálogo.",
  },
  {
    key: "citas",
    label: "Citas",
    title: "Agenda y pacientes",
    hint: "Hoy se ve distinto. Toca un día para ver citas o agendar. Abajo está tu lista de pacientes.",
  },
] as const;

export type ClinicViewKey = (typeof CLINIC_VIEWS)[number]["key"];

export function isClinicViewKey(value: string | null | undefined): value is ClinicViewKey {
  return CLINIC_VIEWS.some((view) => view.key === value);
}

/**
 * Administrar una clínica verificada: segmentado con las cuatro secciones y una tarjeta con la
 * elegida (título y pista de qué se edita). La sección la controla la URL (`view`/`onViewChange`).
 */
export default function ClinicManagePanel({
  place,
  view,
  onViewChange,
  onSaved,
}: {
  place: MyPetPlace;
  view: ClinicViewKey;
  onViewChange: (view: ClinicViewKey) => void;
  onSaved: () => void;
}) {
  const current = CLINIC_VIEWS.find((item) => item.key === view) ?? CLINIC_VIEWS[0];

  return (
    <div className="flex flex-col gap-4">
      <DashSegmented
        ariaLabel={`Secciones de ${place.name}`}
        value={current.key}
        onChange={onViewChange}
        items={CLINIC_VIEWS.map((item) => ({ id: item.key, label: item.label }))}
      />
      {/* `key`: al cambiar de sección la tarjeta se remonta y repite su entrada. */}
      <DashSectionCard key={current.key} title={current.title} description={current.hint}>
        {current.key === "datos" ? <ClinicDataForm place={place} onSaved={onSaved} /> : null}
        {current.key === "horarios" ? <ClinicHoursForm place={place} onSaved={onSaved} /> : null}
        {current.key === "servicios" ? <ClinicServicesForm place={place} onSaved={onSaved} /> : null}
        {current.key === "citas" ? <ClinicAppointmentsCalendar place={place} onSaved={onSaved} /> : null}
      </DashSectionCard>
    </div>
  );
}
