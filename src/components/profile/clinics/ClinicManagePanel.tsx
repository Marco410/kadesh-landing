"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MyPetPlace } from "kadesh/components/veterinaries/queries";
import { useProfileMotion } from "kadesh/components/profile/motion";
import ClinicAppointmentsCalendar from "./ClinicAppointmentsCalendar";
import ClinicDataForm from "./ClinicDataForm";
import ClinicHoursForm from "./ClinicHoursForm";
import ClinicServicesForm from "./ClinicServicesForm";

const PANELS = [
  {
    key: "data",
    label: "Datos",
    title: "Datos del negocio",
    hint: "Nombre, tipo, contacto y dirección. Esto es lo que sale en la ficha pública.",
  },
  {
    key: "hours",
    label: "Horarios",
    title: "Horario de apertura",
    hint: "Un renglón por día. Los días apagados no aparecen en la ficha.",
  },
  {
    key: "services",
    label: "Servicios",
    title: "Servicios que ofreces",
    hint: "Busca y marca. Si no está, pídelo: lo revisamos y solo entonces sale en el catálogo.",
  },
  {
    key: "appointments",
    label: "Citas",
    title: "Agenda y pacientes",
    hint: "Hoy se ve distinto. Toca un día para ver citas o agendar. Abajo está tu lista de pacientes.",
  },
] as const;

type PanelKey = (typeof PANELS)[number]["key"];

export default function ClinicManagePanel({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const [panel, setPanel] = useState<PanelKey>("data");
  const current = PANELS.find((item) => item.key === panel) ?? PANELS[0];
  const motionPrefs = useProfileMotion();

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-2xl border border-[#d8dee8] dark:border-white/12">
        <div
          role="tablist"
          aria-label={`Secciones de ${place.name}`}
          className="flex overflow-x-auto border-b border-[#d8dee8] bg-[#eef1f6] dark:border-white/12 dark:bg-night"
        >
          {PANELS.map((item) => {
            const selected = panel === item.key;
            return (
              <motion.button
                key={item.key}
                type="button"
                role="tab"
                id={`clinic-tab-${item.key}`}
                aria-controls={`clinic-panel-${item.key}`}
                aria-selected={selected}
                onClick={() => setPanel(item.key)}
                whileTap={motionPrefs.tap}
                className={`relative min-h-11 shrink-0 px-4 text-sm ${
                  selected
                    ? "bg-white font-bold text-kadesh dark:bg-night-raised dark:text-kadesh-200"
                    : "font-medium text-[#5a5a5a] hover:text-[#121212] dark:text-[#9aa3b2] dark:hover:text-white"
                }`}
              >
                {item.label}
                {selected ? (
                  <motion.span
                    layoutId={`clinic-tab-line-${place.id}`}
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-kadesh"
                    transition={motionPrefs.transition}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          id={`clinic-panel-${panel}`}
          aria-labelledby={`clinic-tab-${panel}`}
          className="bg-white px-3 py-4 dark:bg-night-raised sm:px-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-kadesh">
            Estás viendo
          </p>
          <h3 className="mt-0.5 text-base font-bold text-[#121212] dark:text-[#eef1f6]">
            {current.title}
          </h3>
          <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            {current.hint}
          </p>
          <div className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={panel}
                variants={motionPrefs.panel}
                initial={motionPrefs.reduce ? false : "hidden"}
                animate="show"
                exit="exit"
              >
                {panel === "data" ? (
                  <ClinicDataForm place={place} onSaved={onSaved} />
                ) : null}
                {panel === "hours" ? (
                  <ClinicHoursForm place={place} onSaved={onSaved} />
                ) : null}
                {panel === "services" ? (
                  <ClinicServicesForm place={place} onSaved={onSaved} />
                ) : null}
                {panel === "appointments" ? (
                  <ClinicAppointmentsCalendar place={place} onSaved={onSaved} />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
