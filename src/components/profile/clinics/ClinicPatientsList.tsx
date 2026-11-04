"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { normalizePhone } from "kadesh/components/profile/validateProfile";
import {
  CREATE_PET_PLACE_PATIENT_MUTATION,
  type ClinicPatient,
  type CreatePetPlacePatientResponse,
  type CreatePetPlacePatientVariables,
  type MyPetPlace,
} from "kadesh/components/veterinaries/queries";
import { graphqlErrorMessage } from "kadesh/components/veterinaries/appointments";
import { INPUT_CLASS, LABEL_CLASS } from "./formStyles";
import { useProfileMotion } from "kadesh/components/profile/motion";

function patientLabel(patient: ClinicPatient): string {
  return [patient.name, patient.lastName].filter(Boolean).join(" ") || "Paciente";
}

export default function ClinicPatientsList({
  place,
  onSaved,
}: {
  place: MyPetPlace;
  onSaved: () => void;
}) {
  const patients = place.patients ?? [];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const motionPrefs = useProfileMotion();

  const [createPatient, { loading }] = useMutation<
    CreatePetPlacePatientResponse,
    CreatePetPlacePatientVariables
  >(CREATE_PET_PLACE_PATIENT_MUTATION);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(null);
    if (!name.trim()) {
      setError("Escribe el nombre del paciente.");
      return;
    }
    try {
      const { data } = await createPatient({
        variables: {
          input: {
            petPlaceId: place.id,
            name: name.trim(),
            lastName: lastName.trim() || undefined,
            phone: normalizePhone(phone) || undefined,
            email: email.trim() || undefined,
          },
        },
      });
      const result = data?.createPetPlacePatient;
      if (!result?.success) {
        setError(result?.message ?? "No pudimos dar de alta al paciente.");
        return;
      }
      setName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setOpen(false);
      setSaved(result.message);
      onSaved();
    } catch (err) {
      setError(graphqlErrorMessage(err, "No pudimos dar de alta al paciente."));
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <h4 className="text-sm font-bold text-dash-ink">
          Pacientes ({patients.length})
        </h4>
        <motion.button
          type="button"
          onClick={() => setOpen((value) => !value)}
          whileTap={motionPrefs.tap}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3 text-sm font-semibold rounded-full border border-dash-line-strong bg-dash-surface text-dash-ink transition-colors hover:border-kadesh-400"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
          {open ? "Cerrar formulario" : "Nuevo paciente"}
        </motion.button>
      </div>
      <p className="text-sm text-dash-muted">
        Al darlo de alta se crea su cuenta en Kadesh y queda ligado a esta clínica. Con el correo podemos avisarle de la cita.
      </p>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.form
            key="patient-form"
            onSubmit={handleSubmit}
            variants={motionPrefs.expand}
            initial={motionPrefs.reduce ? false : "hidden"}
            animate="show"
            exit="exit"
            className="space-y-3 overflow-hidden rounded-xl border border-dash-line p-3"
          >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL_CLASS}>Nombre *</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={INPUT_CLASS}
                autoComplete="given-name"
              />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>Apellido</span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={INPUT_CLASS}
                autoComplete="family-name"
              />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>Teléfono</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={INPUT_CLASS}
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className={LABEL_CLASS}>Correo</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={INPUT_CLASS}
                autoComplete="email"
              />
            </label>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
          >
            {loading ? "Guardando…" : "Dar de alta"}
          </button>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {saved ? (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">{saved}</p>
      ) : null}

      {patients.length === 0 ? (
        <p className="text-sm text-dash-muted">
          Aún no hay pacientes. Dalos de alta para poder agendarles.
        </p>
      ) : (
        <motion.ul
          className="divide-y divide-dash-line overflow-hidden rounded-xl border border-dash-line"
          variants={motionPrefs.list}
          initial={motionPrefs.reduce ? false : "hidden"}
          animate="show"
        >
          {patients.map((patient) => (
            <motion.li
              key={patient.id}
              variants={motionPrefs.item}
              className="px-3 py-2.5"
            >
              <p className="text-sm font-semibold text-dash-ink">
                {patientLabel(patient)}
              </p>
              <p className="break-words text-xs text-dash-muted">
                {[patient.phone, patient.email].filter(Boolean).join(" · ") ||
                  "Sin teléfono ni correo"}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
